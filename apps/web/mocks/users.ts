import type { UserView } from "../lib/types";

/** The signed-in customer used across all mock screens. */
export const currentUser: UserView = {
  id: "usr_cust_01",
  fullName: "Maya Fernandes",
  email: "maya.fernandes@example.com",
  role: "customer",
};

export const agents: Record<string, UserView> = {
  usr_agent_01: {
    id: "usr_agent_01",
    fullName: "Devon Pryce",
    email: "devon.pryce@helpdesk.live",
    role: "agent",
  },
  usr_agent_02: {
    id: "usr_agent_02",
    fullName: "Aisha Khan",
    email: "aisha.khan@helpdesk.live",
    role: "agent",
  },
};
