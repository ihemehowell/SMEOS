import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAccess } from "../middleware/org-access.middleware.js";
import { create, getById, list, remove, update } from "../controllers/expence.controller.js";


export const expenseRouter = Router({ mergeParams: true });

expenseRouter.use(requireAuth, asyncHandler(requireOrgAccess));

expenseRouter.get("/", asyncHandler(list));
expenseRouter.post("/", asyncHandler(create));
expenseRouter.get("/:expenseId", asyncHandler(getById));
expenseRouter.patch("/:expenseId", asyncHandler(update));
expenseRouter.delete("/:expenseId", asyncHandler(remove));