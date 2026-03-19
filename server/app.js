const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const encryptRoute = require('./routes/encrypt');
const vaultRoute = require('./routes/vault');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting: max 20 creations per 15 minutes per IP to prevent storage exhaustion
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many vaults created from this IP, please try again later.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/encrypt', createLimiter, encryptRoute);
app.use('/api/vault', vaultRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/create.html'));
});

app.get('/vault/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/vault.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏴‍☠️ BanditsVault server running on port ${PORT}`);
  });
}
module.exports = app;