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

  const command = `npx concurrently -n api,web -c cyan,magenta \".\\.venv\\Scripts\\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port ${selectedPort} --reload\" \"npm:dev\"`;

  const child = spawn(command, {
    shell: true,
    stdio: "inherit",
    env,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(`[dev:all] ${error.message}`);
  process.exit(1);
});
