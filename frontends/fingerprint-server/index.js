/* server/index.js ---------------------------------------------------------- */
import express from "express";
import fingerprintRoute from "./routes/fingerprint.js";
import seniorDataRoute from "./routes/senior-data.js";


const app = express();
const PORT = 8080;       

app.use("/api", fingerprintRoute);
app.use("/api", seniorDataRoute);

app.listen(PORT, () =>
  console.log(`HTTP API listening on http://localhost:${PORT}`),
);


