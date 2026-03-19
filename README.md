# BanditsVault: Encrypt. Share. Self-Destruct.
A vault system that allows users to encrypt and share secrets like text, images, or videos via one-time-use secure links. Once the recipient views the content, it is selfdestructed forever, ensuring private and secure transmission of sensitive information

**By:** Team EP6xBandits

## Features

- Supports **text, image, and video** encryption
- One-time secret link generation
- Optional **PIN** protection
- Expiry time: **10 mins / 1 hour / 1 day**
- **Auto self-destruct** after first view
- Mysterious, **hacker-themed & royal** UI

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## UI Theme: *"Bandit's Gold"*
A nostalgic blend of **premium outlaw mystique**: royal colors, vintage textures, and retro-steel vibes — styled for digital bandits.

## How It Works

1. **Encrypt:** Content encrypted client-side with AES-256
2. **Share:** Short, secure link generated
3. **View & Destroy:** Vault self-destructs after first access

## Architecture & Security (Vercel & PostgreSQL)
This repository is fully configured for zero-configuration serverless deployments on **Vercel** using **PostgreSQL** (e.g., CockroachDB, Neon). It incorporates several robust architectural safeguards:
- **Zero-Knowledge Architecture:** The decryption key (`accessToken`) never leaves the browser URL fragment (`#token`). The server only stores AES-256 encrypted blobs and is blind to the raw data.
- **Race Condition Prevention:** Implements Atomic SQL `UPDATE...RETURNING` queries to prevent Time-of-Check to Time-of-Use (TOCTOU) concurrent access vulnerabilities.
- **Anti-Brute Force:** The vault is permanently destroyed immediately upon 3 incorrect PIN attempts.
- **DDoS Mitigation:** Vault creation payloads are capped at 10MB, and endpoints are rate-limited (`express-rate-limit`) to prevent free-tier storage exhaustion.
- **Automated Garbage Collection:** The database automatically and lazily cleans up globally expired records in the background without requiring a dedicated cron job.

## Team Members

|Tirth A Patel        |
|---------------------|
|Jyotirmoy Karmakar   |
|Sanika Pokharkar     |
|Nikhil Bhardwaj      |
|Krupa Bhosle         |
|Prasad Shinde        |
---

*🗝️ Only the worthy shall unlock… and once they do, it vanishes into the abyss.*
