import { ProjectStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  buildMarketplaceWhere,
  isPlaceholderText,
  mapListingRow,
  marketplaceOrderBy,
  type MarketplaceQuery,
} from "../projects/project.mapper.js";

export async function listMarketplaceListings(query: MarketplaceQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 12));
  const where = buildMarketplaceWhere(query);

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: {
        farmer: true,
        media: { orderBy: { sortOrder: "asc" } },
        investments: { where: { status: "CONFIRMED" }, select: { userId: true } },
      },
      orderBy: marketplaceOrderBy(query.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const listings = projects
    .filter((p) => !isPlaceholderText(p.title) && !isPlaceholderText(p.farmer.displayName))
    .map(mapListingRow);

  const stats = await prisma.project.aggregate({
    where: { status: ProjectStatus.ACTIVE, farmer: { verificationStatus: "VERIFIED" } },
    _sum: { targetAmount: true, raisedAmount: true },
    _count: true,
  });

  return {
    listings,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    stats: {
      projectCount: stats._count,
      totalTarget: Number(stats._sum.targetAmount ?? 0),
      totalRaised: Number(stats._sum.raisedAmount ?? 0),
    },
  };
}
