import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("schedule.db");

db.run(`
  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT,
    message TEXT,
    scheduled_at INTEGER
  )
`);


