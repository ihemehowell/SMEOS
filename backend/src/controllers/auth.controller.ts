import type { Request, Response } from "express";

import { getCurrentUser, loginUser, registerUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "@smeo/shared";

export async function register(request: Request, response: Response) {
  const parsedBody = registerSchema.parse(request.body);
  const result = await registerUser(parsedBody);
  response.status(201).json(result);
}

export async function login(request: Request, response: Response) {
  const parsedBody = loginSchema.parse(request.body);
  const result = await loginUser(parsedBody);
  response.json(result);
}

export async function me(request: Request, response: Response) {
  if (!request.user?.userId) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  const currentUser = await getCurrentUser(request.user.userId);

  if (!currentUser) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.json({ user: currentUser });
}