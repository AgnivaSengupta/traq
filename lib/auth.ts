import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { nextCookies } from "better-auth/next-js";

const prism = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prism, {provider: 'postgresql'}),
  
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: "",
      clientSecret: "",
    }
  },
  plugins: [nextCookies()]
})