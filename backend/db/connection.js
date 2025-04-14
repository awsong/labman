import betterSqlite3 from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(__dirname, "..", "labman.db");
const db = new betterSqlite3(dbPath);

export default db;
