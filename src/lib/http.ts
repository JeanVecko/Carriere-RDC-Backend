import type { Request } from "express";

/** Express 5 types route params as `string | string[]` to allow repeated segments; our routes only ever use single named params. */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0]! : value;
}
