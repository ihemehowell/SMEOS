import { Router } from "express";

import {
  create,
  getById,
} from "../controllers/organization.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const organizationRouter = Router();

organizationRouter.post("/", requireAuth, asyncHandler(create));
organizationRouter.get("/:organizationId", requireAuth, asyncHandler(getById));