import dotenv from "dotenv";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadLocalImageToCloudinary } from "@/lib/upload-local-cloudinary";

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const members = [
  {
    name: "enter-your-name",
    email: "your-email@gmail.com",
    phone: "9112345715",
    imageUrl: "/members/avatar.jpg",
    skills: ["skill"],
    year: "1",
  },
];

const seedMembers = async () => {
  try {
    for (const member of members) {
      const imageUrl = await uploadLocalImageToCloudinary(
        member.imageUrl.replace("/members/", "members/"),
        "club-members"
      );

      await prisma.member.create({
        data: {
          ...member,
          imageUrl,
        },
      });

      console.log(`✔ Added ${member.name}`);
    }

    console.log(`All ${members.length} members added successfully.`);
  } catch (error) {
    console.error("Failed to add members:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedMembers();
