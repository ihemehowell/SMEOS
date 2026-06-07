import { Router, type RequestHandler } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAccess } from "../middleware/org-access.middleware.js";
import { stats } from "../controllers/stats.controller.js";

export const statsRouter = Router({ mergeParams: true });

statsRouter.use(requireAuth, asyncHandler(requireOrgAccess));
statsRouter.get(
  "/",
  asyncHandler(async (request, response, next) => {
    return stats(request, response, next);
  })
);