import type { Request, Response } from "express";
import { getDashboardStats } from "../services/stats.service.js";

export async function stats(request: Request, response: Response) {
  const { organizationId } = request.params;
  const data = await getDashboardStats(organizationId);
  response.json({ stats: data });
}