import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { organizationRouter } from "./routes/organization.routes.js";
import { customerRouter } from "./routes/customer.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
const port = env.PORT;

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/v1/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/organizations/:organizationId/customers", customerRouter);

app.use("/api/v1", (_request, response) => {
  response.json({ message: "Backend is running", service: "Express API" });
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});