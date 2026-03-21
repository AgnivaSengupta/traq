import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { PrismaClient } from "./generated/prisma/client";
// import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { initUserBoard } from "./init-user-board";

const client = new MongoClient(process.env.DATABASE_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            try {
              await initUserBoard(user.id);
            } catch (error) {
              console.error("Failed to init board:", error);
            }
          }
        },
      },
    },
  },
  // plugins: [nextCookies()]
  additionalFields: {
    profilePic: {
      type: "string",
      optional: true,
      defaultValue: "",
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result;
}
