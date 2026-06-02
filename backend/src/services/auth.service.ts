import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import type { LoginInput, RegisterInput } from "@smeo/shared";

function createToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new HttpError(409, "Email already in use", "EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    user,
    token: createToken(user.id),
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token: createToken(user.id),
  };
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        select: {
          id: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}