import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initSocketServer } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);
initSocketServer(httpServer);

connectDB().catch((error) => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
