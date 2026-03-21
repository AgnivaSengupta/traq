"use server";

import { headers } from "next/headers";
import { auth, getSession } from "../auth";
// import { connectDB } from "../db";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URI!);
const db = client.db();

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
  } catch (error) {
    // Return error shape
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Registration failed",
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
  } catch (error) {
    // Better Auth errors usually have a 'message' or 'body.message'
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};

export const updateProfilePicture = async (profilePic: string) => {
  try {
    const result = await auth.api.updateUser({
      headers: await headers(),
      body: {
        image: profilePic || null,
        profilePic,
      },
    });

    return { success: true, data: result, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update profile picture",
    };
  }
};

export const signOutOtherSessions = async () => {
  try {
    await client.connect();
    const currentSession = await getSession();

    if (!currentSession?.user?.id || !currentSession?.session?.id){
      return {success: false, error: "Unauthorized"};
    }

    const result = await db.collection("session").deleteMany({
      userId: currentSession.user.id,
      id: { $ne: currentSession.session.id },
    });

    return {
      success: true,
      error: null,
      deletedCount: result.deletedCount,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to sign out other sessions",
    };
  }
};
