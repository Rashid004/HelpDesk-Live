import type { HydratedDocument } from "mongoose";
import type { User } from "@repo/shared";
import type { UserDoc } from "./user.model.js";

export function toUserDTO(doc: HydratedDocument<UserDoc>): User {
  const { _id, password, refreshTokens, statusUpdates, ...obj } = doc.toObject();

  return {
    ...obj,
    id: _id.toString(),
    statusUpdates: statusUpdates.map((update) => ({
      status: update.status,
      note: update.note,
      changedAt: update.changedAt,
      changedBy: update.changedBy.toString(),
    })),
    refreshTokens: [],
  };
}

export function toUserDTOList(docs: HydratedDocument<UserDoc>[]): User[] {
  return docs.map(toUserDTO);
}
