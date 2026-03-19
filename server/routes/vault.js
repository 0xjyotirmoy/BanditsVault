const express = require('express');
const { pool } = require('../utils/db');

const router = express.Router();

router.get('/:vaultId', async (req, res) => {
  const { vaultId } = req.params;
  const { pin } = req.query;
  
  try {
    // Atomic UPDATE prevents race conditions (TOCTOU)
    const result = await pool.query(
      'UPDATE vaults SET accessed = true WHERE vault_id = $1 AND accessed = false AND expiry_time > $2 RETURNING *',
      [vaultId, Date.now()]
    );
    const vault = result.rows[0];
    
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found or expired' });
    }
    
    // PIN Logic (3 strikes you're out)
    if (vault.pin && vault.pin !== pin) {
      if (vault.failed_attempts >= 2) {
        // 3rd failed attempt -> Delete immediately to prevent brute-force
        await pool.query('DELETE FROM vaults WHERE vault_id = $1', [vaultId]);
        return res.status(401).json({ error: 'Too many incorrect PIN attempts. Vault highly compromised and permanently destroyed.' });
      } else {
        // Increment attempts and revert 'accessed' to false so they can try again
        await pool.query('UPDATE vaults SET failed_attempts = failed_attempts + 1, accessed = false WHERE vault_id = $1', [vaultId]);
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }
    
    res.json({
      encryptedContent: vault.encrypted_content,
      encryptedKeyBlob: vault.encrypted_key_blob,
      blobIv: vault.blob_iv,
      contentType: vault.content_type,
      destructTimer: vault.destruct_timer || 120
    });
    
    // Auto-delete after responding
    setTimeout(async () => {
      try {
        await pool.query('DELETE FROM vaults WHERE vault_id = $1', [vaultId]);
      } catch (err) {
        console.error('Failed to delete vault:', err);
      }
    }, 1000);
    
  } catch (err) {
    console.error('Error fetching vault:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
