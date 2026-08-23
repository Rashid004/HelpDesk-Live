import type { CreateUserDTO } from "@repo/shared";
import { UserModel } from "../users/user.model.js";

class AuthRepository {
    create(data: CreateUserDTO) {
        return UserModel.create(data);
    }

    findByEmail(email: string) {
        return UserModel.findOne({ email });
    }

    findById(id: string) {
        return UserModel.findById(id);
    }
}

export const authRepository = new AuthRepository();
