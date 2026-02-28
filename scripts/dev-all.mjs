import net from "node:net";
import { spawn } from "node:child_process";

const START_PORT = Number.parseInt(process.env.API_PORT || "3001", 10);
const MAX_ATTEMPTS = 20;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(startPort) {
  for (let offset = 0; offset < MAX_ATTEMPTS; offset += 1) {
    const port = startPort + offset;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }

  throw new Error(
    `No available backend port found in range ${startPort}-${startPort + MAX_ATTEMPTS - 1}`,
  );
}

async function main() {
  const selectedPort = await findAvailablePort(START_PORT);
  const env = {
    ...process.env,
    API_PORT: String(selectedPort),
    VITE_API_PORT: String(selectedPort),
  };

  console.log(`[dev:all] Using backend port ${selectedPort}`);

  const pythonCommand =
    process.platform === "win32"
      ? ".\\.venv\\Scripts\\python.exe"
      : "./.venv/bin/python";
  const npmCommand = process.platform === "win32" ? "npm" : "npm";

  const api = spawn(
    pythonCommand,
    [
      "-m",
      "uvicorn",
      "backend.main:app",
      "--host",
      "0.0.0.0",
      "--port",
      String(selectedPort),
      "--reload",
    ],
    {
      stdio: "inherit",
      env,
    },
  );

  const web = spawn(`${npmCommand} run dev`, {
    stdio: "inherit",
    env,
    shell: true,
  });

  let shuttingDown = false;

  const stopChildren = () => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    api.kill("SIGTERM");
    web.kill("SIGTERM");
  };

  process.on("SIGINT", stopChildren);
  process.on("SIGTERM", stopChildren);

  api.on("exit", (code) => {
    if (!shuttingDown) {
      stopChildren();
      process.exit(code ?? 1);
    }
  });

  web.on("exit", (code) => {
    if (!shuttingDown) {
      stopChildren();
      process.exit(code ?? 1);
    }
  });
}

main().catch((error) => {
  console.error(`[dev:all] ${error.message}`);
  process.exit(1);
});
