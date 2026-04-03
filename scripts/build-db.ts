import Database from "better-sqlite3";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const JSON_PATH = join(__dirname, "..", "public", "data", "NFC.json");
const DB_PATH = join(__dirname, "..", "public", "data", "nfc.db");

type RawPost = {
  id: number;
  poster: {
    user: {
      userId: number;
      username: string;
      displayName: string;
    };
  } | null;
  body: string;
  created: string;
  updated: string;
};

console.log("Reading NFC.json...");
const raw = readFileSync(JSON_PATH, "utf-8");
const posts: RawPost[] = JSON.parse(raw);
console.log(`Parsed ${posts.length} posts`);

// Remove existing DB if present
if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);

// Enable WAL mode for faster writes during build
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE posts (
    id INTEGER PRIMARY KEY,
    poster_user_id INTEGER,
    poster_username TEXT,
    poster_display_name TEXT,
    body TEXT,
    created TEXT,
    created_ms INTEGER
  );

  CREATE TABLE timestamps (
    created_ms INTEGER NOT NULL,
    is_banned INTEGER NOT NULL
  );
`);

// Bulk insert posts
console.log("Inserting posts...");
const insertPost = db.prepare(`
  INSERT INTO posts (id, poster_user_id, poster_username, poster_display_name, body, created, created_ms)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertTimestamp = db.prepare(`
  INSERT INTO timestamps (created_ms, is_banned)
  VALUES (?, ?)
`);

const insertAll = db.transaction(() => {
  for (const post of posts) {
    const createdMs = new Date(post.created).getTime();
    const poster = post.poster;
    insertPost.run(
      post.id,
      poster?.user.userId ?? null,
      poster?.user.username ?? null,
      poster?.user.displayName ?? null,
      post.body,
      post.created,
      createdMs
    );
    insertTimestamp.run(createdMs, poster === null ? 1 : 0);
  }
});

insertAll();
console.log(`Inserted ${posts.length} posts`);

// Create indexes
console.log("Creating indexes...");
db.exec(`
  CREATE INDEX idx_posts_username ON posts(poster_username COLLATE NOCASE);
  CREATE INDEX idx_posts_created_ms ON posts(created_ms);
  CREATE INDEX idx_timestamps_ms ON timestamps(created_ms);
  CREATE INDEX idx_timestamps_banned ON timestamps(is_banned, created_ms);
`);

// Create FTS5 index for body text search
console.log("Building full-text search index...");
db.exec(`
  CREATE VIRTUAL TABLE posts_fts USING fts5(body, content=posts, content_rowid=id);
  INSERT INTO posts_fts(posts_fts) VALUES('rebuild');
`);

// Switch to DELETE mode for read-only deployment
db.pragma("journal_mode = DELETE");

// Compact
db.exec("VACUUM");

const count = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
console.log(`Done. Database has ${count.count} posts.`);

db.close();
