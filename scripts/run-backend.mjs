import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const reloadEnabled = args.includes("--reload");
const port = Number.parseInt(process.env.API_PORT || "3001", 10);

const commandParts = [
  ".\\.venv\\Scripts\\python.exe",
  "-m",
  "uvicorn",
  "backend.main:app",
  "--host",
  "0.0.0.0",
  "--port",
  String(port),
];

if (reloadEnabled) {
  commandParts.push("--reload");
}

const child = spawn(commandParts.join(" "), {
  shell: true,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
