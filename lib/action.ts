"use server";

import { db } from "@/db";
import { Plan, plans, tasksTable } from "@/db/schema";
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

export async function getPlans(): Promise<ServerResponse<Plan[]>> {
  try {
    const result = await db.select().from(plans);

    return {
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Failed to fetch plans",
    };
  }
}
