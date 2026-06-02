import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AuthTokenPayload } from "../types/auth.js";

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Missing bearer token" });
    return;
  }

  const token = authorization.slice(7);

  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}