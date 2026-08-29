import type { User } from "@repo/shared";

/**
 * Mock user data. Shapes follow @repo/shared's `User` schema so swapping
 * in real API responses later is a drop-in change.
 * TODO: replace with real GET /api/users (agents) + GET /api/auth/me.
 */

type MockAgent = Pick<User, "id" | "fullName" | "email" | "role"> & {
  profileImageUrl?: string;
  department: "billing" | "technical" | "general";
};

export const AGENTS: MockAgent[] = [
  {
    id: "agt_01",
    fullName: "Priya Nair",
    email: "priya.nair@helpdesklive.io",
    role: "agent",
    department: "technical",
    profileImageUrl: "https://i.pravatar.cc/120?img=47",
  },
  {
    id: "agt_02",
    fullName: "Marcus Bell",
    email: "marcus.bell@helpdesklive.io",
    role: "agent",
    department: "billing",
    profileImageUrl: "https://i.pravatar.cc/120?img=12",
  },
  {
    id: "agt_03",
    fullName: "Sofia Alvarez",
    email: "sofia.alvarez@helpdesklive.io",
    role: "agent",
    department: "general",
    profileImageUrl: "https://i.pravatar.cc/120?img=32",
  },
  {
    id: "agt_04",
    fullName: "Tom Okafor",
    email: "tom.okafor@helpdesklive.io",
    role: "agent",
    department: "technical",
    profileImageUrl: "https://i.pravatar.cc/120?img=15",
  },
];

/** The signed-in agent (mock "current user"). */
export const CURRENT_AGENT = AGENTS[0];

export const MOCK_UNREAD_NOTIFICATIONS = 4;

export function agentById(id: string | null | undefined): MockAgent | undefined {
  if (!id) return undefined;
  return AGENTS.find((a) => a.id === id);
}

type MockCustomer = Pick<User, "id" | "fullName" | "email" | "role"> & {
  profileImageUrl?: string;
};

export const CUSTOMERS: MockCustomer[] = [
  { id: "cus_01", fullName: "Elena Fischer", email: "elena.fischer@gmail.com", role: "customer" },
  { id: "cus_02", fullName: "Raj Patel", email: "raj.patel@outlook.com", role: "customer" },
  { id: "cus_03", fullName: "Chloe Martin", email: "chloe.martin@proton.me", role: "customer" },
  { id: "cus_04", fullName: "Derek Wu", email: "derek.wu@fastmail.com", role: "customer" },
  { id: "cus_05", fullName: "Amara Okoye", email: "amara.okoye@gmail.com", role: "customer" },
  { id: "cus_06", fullName: "Liam Brennan", email: "liam.brennan@yahoo.com", role: "customer" },
  { id: "cus_07", fullName: "Yuki Tanaka", email: "yuki.tanaka@gmail.com", role: "customer" },
  { id: "cus_08", fullName: "Sara Lindqvist", email: "sara.lindqvist@hey.com", role: "customer" },
  { id: "cus_09", fullName: "Omar Haddad", email: "omar.haddad@gmail.com", role: "customer" },
  { id: "cus_10", fullName: "Grace Kim", email: "grace.kim@icloud.com", role: "customer" },
  { id: "cus_11", fullName: "Tobias Neumann", email: "tobias.neumann@gmx.de", role: "customer" },
  { id: "cus_12", fullName: "Priyanka Rao", email: "priyanka.rao@gmail.com", role: "customer" },
];

export function customerById(id: string | null | undefined): MockCustomer | undefined {
  if (!id) return undefined;
  return CUSTOMERS.find((c) => c.id === id);
}
