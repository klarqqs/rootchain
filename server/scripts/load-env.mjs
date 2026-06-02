import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(serverRoot, "..");

config({ path: resolve(serverRoot, ".env") });
config({ path: resolve(repoRoot, ".env"), override: false });
