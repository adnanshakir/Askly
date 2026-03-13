import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

connectDB().catch((error) => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
