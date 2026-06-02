import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.issues,
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
}