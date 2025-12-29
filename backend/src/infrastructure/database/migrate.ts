import { sqlite } from './connection.js';

// Run migrations - create tables if they don't exist
export function runMigrations() {
    console.log('Running database migrations...');

    // Create conversations table
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      metadata TEXT
    )
  `);

    // Create messages table
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);

    // Create index for faster message lookups by conversation
    sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
    ON messages(conversation_id)
  `);

    console.log('Migrations completed successfully!');
}

// Run if this file is executed directly
runMigrations();
