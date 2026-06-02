import "../scripts/load-env.mjs";
import bcrypt from "bcryptjs";
import {
  FarmerVerificationStatus,
  PrismaClient,
  ProjectStatus,
  RiskLevel,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@rootchain.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      fullName: adminName,
    },
  });

  console.log(`Seeded admin user: ${adminEmail}`);
}

async function seedDemoMarketplace() {
  if (process.env.SEED_DEMO === "false") return;

  const activeCount = await prisma.project.count({
    where: { status: ProjectStatus.ACTIVE, farmer: { verificationStatus: "VERIFIED" } },
  });
  if (activeCount > 0) {
    console.log(`Demo marketplace skipped — ${activeCount} active listing(s) already exist.`);
    return;
  }

  const farmerEmail = (process.env.SEED_DEMO_FARMER_EMAIL ?? "farmer@rootchain.local").toLowerCase();
  const farmerPassword = process.env.SEED_DEMO_FARMER_PASSWORD ?? "DemoFarmer123!";
  const passwordHash = await bcrypt.hash(farmerPassword, 12);

  const farmerUser = await prisma.user.upsert({
    where: { email: farmerEmail },
    create: {
      email: farmerEmail,
      passwordHash,
      role: Role.FARMER,
      fullName: "Amina Okafor",
    },
    update: {},
  });

  const farmerProfile = await prisma.farmerProfile.upsert({
    where: { userId: farmerUser.id },
    create: {
      userId: farmerUser.id,
      displayName: "Ogun Highlands Cooperative",
      location: "Ogun State, Nigeria",
      bio: "Verified maize cooperative — milestone reporting on Stellar USDC rail.",
      verificationStatus: FarmerVerificationStatus.VERIFIED,
      verifiedAt: new Date(),
    },
    update: {
      verificationStatus: FarmerVerificationStatus.VERIFIED,
      verifiedAt: new Date(),
    },
  });

  const farm = await prisma.farm.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      ownerId: farmerUser.id,
      name: "Ogun Highlands — Block A",
      location: "Ogun State, Nigeria",
      sizeHectares: 120,
    },
    update: {},
  });

  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 8);

  await prisma.project.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      farmerId: farmerProfile.id,
      farmId: farm.id,
      title: "Premium Maize Season — Irrigated Block A",
      description:
        "Institutional-grade maize cycle with verified cooperative governance, GPS field attestation, and USDC escrow milestones.",
      cropType: "maize",
      location: "Ogun State, Nigeria",
      targetAmount: 250_000,
      raisedAmount: 42_500,
      expectedRoiPct: 18.5,
      riskLevel: RiskLevel.MEDIUM,
      aiScore: 82,
      trustScore: 88,
      predictedRoiPct: 17.2,
      harvestTimeline: "Q4 2026",
      startDate: start,
      endDate: end,
      status: ProjectStatus.ACTIVE,
      media: {
        create: [
          {
            kind: "IMAGE",
            url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200",
            caption: "Field establishment — Block A",
            sortOrder: 0,
          },
        ],
      },
    },
    update: {
      status: ProjectStatus.ACTIVE,
      farmerId: farmerProfile.id,
    },
  });

  console.log("Seeded demo marketplace listing (1 active project).");
  console.log(`  Farmer login: ${farmerEmail} / ${farmerPassword}`);
}

async function main() {
  await seedAdmin();
  await seedDemoMarketplace();
  console.log("Change SEED_* passwords before production deploy.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
