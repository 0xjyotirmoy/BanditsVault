const express = require('express');
const { generateAccessToken } = require('../utils/neatbandit');
const { pool } = require('../utils/db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { encryptedContent, encryptedKeyBlob, blobIv, contentType, pin, expiryHours, destructTimer } = req.body;
  
  const vaultId = generateAccessToken(8);
  const accessToken = generateAccessToken(12);
  const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
  
  // Lazy Database Cleanup: Delete expired vaults in the background (~5% probability to reduce DB load)
  if (Math.random() < 0.05) {
    pool.query('DELETE FROM vaults WHERE expiry_time < $1', [Date.now()]).catch(err => console.error('Cleanup error:', err));
  }
  
  try {
    await pool.query(
      `INSERT INTO vaults (vault_id, encrypted_content, encrypted_key_blob, blob_iv, content_type, pin, expiry_time, destruct_timer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [vaultId, encryptedContent, encryptedKeyBlob, blobIv, contentType, pin || null, expiryTime, destructTimer || 120, Date.now()]
    );
    
    res.json({ 
      vaultId, 
      accessToken,
      link: `${req.protocol}://${req.get('host')}/vault/${vaultId}#${accessToken}`
    });
  } catch (err) {
    console.error('Error creating vault:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;