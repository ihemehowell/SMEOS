import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { env } from "../config/env.js";
import { PrismaClient } from "../generated/client.js";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg(new Pool({ connectionString: env.DIRECT_URL }));

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}