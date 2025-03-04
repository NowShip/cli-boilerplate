"use server";

import { db } from "@/db";
import { plans, tasksTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createTask(title: string) {
  await db.insert(tasksTable).values({ title });
}

export async function getTasks() {
  return await db.select().from(tasksTable);
}

export async function deleteTask(id: number) {
  await db.delete(tasksTable).where(eq(tasksTable.id, id));
}

export async function updateTask(id: number, title: string) {
  await db.update(tasksTable).set({ title }).where(eq(tasksTable.id, id));
}

export async function getPlans() {
  try {
    return await db.select().from(plans);
  } catch (error) {
    // Log the error for debugging
    console.error("Failed to fetch plans:", error);

    // Rethrow with a more user-friendly message
    throw new Error(
      "Unable to fetch subscription plans. Please try again later."
    );
  }
}
