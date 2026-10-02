import { readFileSync, readdirSync } from "node:fs";
import { repoPath } from "./paths.js";

export function readJson<T>(...parts: string[]): T {
  return JSON.parse(readFileSync(repoPath(...parts), "utf8")) as T;
}

export function readText(...parts: string[]): string {
  return readFileSync(repoPath(...parts), "utf8");
}

export function listJson(dir: string): string[] {
  return readdirSync(repoPath(dir))
    .filter((name) => name.endsWith(".json") && name !== "schema.json")
    .sort();
}
