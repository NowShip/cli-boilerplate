import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Convert all keys in an object from camelCase to snake_case
export function convertKeysToSnakeCase(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      toSnakeCase(key),
      // If value is an object, recursively convert its keys too
      value && typeof value === "object" && value.constructor === Object
        ? convertKeysToSnakeCase(value as Record<string, unknown>)
        : value,
    ])
  );
}

export function formatPrice(price?: number) {
  if (!price) return "";

  return `$${(price / 100).toFixed(2)}`;
}
