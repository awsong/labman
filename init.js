import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Initializing LabMan - 科研项目管理系统...");

// Create backend directory if it doesn't exist
const backendDir = path.join(__dirname, "backend");
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
  console.log("Created backend directory");
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(backendDir, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

// Install dependencies
try {
  console.log("Installing dependencies...");
  try {
    // First try to install with better-sqlite3
    execSync("npm install", { stdio: "inherit" });
    console.log("Dependencies installed successfully");
  } catch (betterSqliteError) {
    console.error(
      "Error installing better-sqlite3. Trying with sqlite3 fallback..."
    );

    // If better-sqlite3 fails, remove it and use sqlite3 instead
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    delete packageJson.dependencies["better-sqlite3"];

    // Make sure sqlite3 is included
    packageJson.dependencies["sqlite3"] = "^5.1.7";

    // Write the modified package.json
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

    // Try installing again with modified package.json
    execSync("npm install", { stdio: "inherit" });
    console.log("Dependencies installed successfully with sqlite3 fallback");
  }
} catch (error) {
  console.error("Error installing dependencies:", error.message);
  console.error("Please try installing dependencies manually: npm install");
  process.exit(1);
}

// Initialize database
try {
  console.log("Initializing database...");
  // This will create the database file and tables when the server starts
  execSync("node backend/server.js --init-only", { stdio: "inherit" });
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error.message);
  console.error(
    "You might need to initialize the database manually when starting the server"
  );
}

console.log("\nLabMan initialization complete!");
console.log("\nTo start the application, run:");
console.log("npm run start");
console.log("\nThis will start both the frontend and backend servers.");
console.log("\nLogin with:");
console.log("Username: admin");
console.log("Password: password");
