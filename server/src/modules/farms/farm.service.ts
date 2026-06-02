import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/api-response.js";

export async function listFarms(userId: string) {
  return prisma.farm.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFarm(
  userId: string,
  input: { name: string; location: string; sizeHectares?: number },
) {
  const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!farmer) throw new AppError(403, "NOT_A_FARMER", "Farmer profile required");

  return prisma.farm.create({
    data: {
      ownerId: userId,
      name: input.name.trim(),
      location: input.location.trim(),
      sizeHectares: input.sizeHectares,
    },
  });
}
