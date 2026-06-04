import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAccess } from "../middleware/org-access.middleware.js";
import {
  list,
  getById,
  create,
  convertFromQuotation,
  update,
  remove,
} from "../controllers/invoice.controller.js";

export const invoiceRouter = Router({ mergeParams: true });

invoiceRouter.use(requireAuth, asyncHandler(requireOrgAccess));

invoiceRouter.get("/", asyncHandler(list));
invoiceRouter.post("/", asyncHandler(create));
invoiceRouter.post("/convert", asyncHandler(convertFromQuotation));
invoiceRouter.get("/:invoiceId", asyncHandler(getById));
invoiceRouter.patch("/:invoiceId", asyncHandler(update));
invoiceRouter.delete("/:invoiceId", asyncHandler(remove));