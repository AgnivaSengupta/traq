"use server";

import { headers } from "next/headers";
import { auth } from "../auth";

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/dashboard",
      },
    });

    // Return success shape
    return { success: true, data: result, error: null };
  } catch (e: any) {
    // Return error shape
    return {
      success: false,
      data: null,
      error: e.message || "Registration failed",
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/dashboard",
      },
    });

    return { success: true, data: result, error: null };
  } catch (e: any) {
    // Better Auth errors usually have a 'message' or 'body.message'
    return { success: false, data: null, error: e.message || "Login failed" };
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};
