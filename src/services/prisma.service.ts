import { PrismaClient } from "./../../generated/prisma";

export const prisma = new PrismaClient();

export const verifyDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    return true;
  } catch {
    return false;
  }
};
