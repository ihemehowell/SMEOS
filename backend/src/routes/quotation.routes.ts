import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAccess } from "../middleware/org-access.middleware.js";
import { list, getById, create, update, remove } from "../controllers/quotation.controller.js";

export const quotationRouter = Router({ mergeParams: true });

quotationRouter.use(requireAuth, asyncHandler(requireOrgAccess));

quotationRouter.get("/", asyncHandler(list));
quotationRouter.post("/", asyncHandler(create));
quotationRouter.get("/:quotationId", asyncHandler(getById));
quotationRouter.patch("/:quotationId", asyncHandler(update));
quotationRouter.delete("/:quotationId", asyncHandler(remove));