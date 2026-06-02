import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAccess } from "../middleware/org-access.middleware.js";
import {
  list,
  getById,
  create,
  update,
  remove,
} from "../controllers/customer.controller.js";

export const customerRouter = Router({ mergeParams: true });

customerRouter.use(requireAuth, asyncHandler(requireOrgAccess));

customerRouter.get("/", asyncHandler(list));
customerRouter.post("/", asyncHandler(create));
customerRouter.get("/:customerId", asyncHandler(getById));
customerRouter.patch("/:customerId", asyncHandler(update));
customerRouter.delete("/:customerId", asyncHandler(remove));