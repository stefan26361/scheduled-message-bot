import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("schedule.db");

db.run(`
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at INTEGER NOT NULL,
  user_id TEXT NOT NULL
)`);

db.run(`
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  schedule_id INTEGER,
  user_id TEXT,
  timestamp INTEGER NOT NULL
)`);



