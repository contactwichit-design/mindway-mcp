import { createServer } from "./server.js";
import { CONFIG } from "./config.js";
import { Logger } from "./logging/logger.js";

const app = createServer();

app.listen(CONFIG.PORT, () => {
  Logger.info(`Mindway MCP Server started on port ${CONFIG.PORT}`, {
    service: CONFIG.SERVICE_NAME,
    version: CONFIG.VERSION,
    canonical_entry: CONFIG.CANONICAL_ENTRY_URL
  });
});
