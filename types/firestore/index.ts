export * from "./heist";

export const COLLECTIONS = {
  HEISTS: "heists",
  USERS: "users",
} as const;

export interface UserProfile {
  id: string;
  codename: string;
}
