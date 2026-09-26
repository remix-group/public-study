import { PrismaClient } from "@prisma/client";
import { seedOpecFunctions } from "./opec-functions.js";

const prisma = new PrismaClient();
try {
  await seedOpecFunctions(prisma);
} finally {
  await prisma.$disconnect();
}
