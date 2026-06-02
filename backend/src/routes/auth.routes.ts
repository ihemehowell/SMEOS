import { Router } from "express";

import { login, me, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", requireAuth, asyncHandler(me));