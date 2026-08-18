import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client.ts";
import { env } from "@/config/env";

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = global.prismaClient ?? new PrismaClient({ adapter });

if (env.nodeEnv !== "production") {
  global.prismaClient = prisma;
}
