-- BugDex Database Schema for Vercel Postgres

-- Users table: Store user profiles
CREATE TABLE IF NOT EXISTS users (
    wallet_address VARCHAR(42) PRIMARY KEY,
    username VARCHAR(50),
    profile_ipfs_hash VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Uploads table: Store bug photo uploads
CREATE TABLE IF NOT EXISTS uploads (
    id VARCHAR(50) PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL,
    image_cid VARCHAR(100) NOT NULL,
    metadata_cid VARCHAR(100) NOT NULL,
    image_url TEXT,
    metadata_url TEXT,
    timestamp BIGINT,
    location JSONB,
    bug_info JSONB,
    submitted_to_blockchain BOOLEAN DEFAULT false,
    submission_id INTEGER,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_wallet ON uploads(wallet_address);
CREATE INDEX IF NOT EXISTS idx_uploads_blockchain ON uploads(submitted_to_blockchain);
CREATE INDEX IF NOT EXISTS idx_uploads_timestamp ON uploads(timestamp DESC);
