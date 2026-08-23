import type { LoginDTO, SignupDTO } from "@repo/shared";
import { authRepository } from "./auth.repository.js";
import { userRepository } from "../users/user.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { comparePassword, hashToken } from "../../lib/hash.js";
import {
    getTokenExpiry,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../lib/jwt.js";
import { toUserDTO } from "../users/user.maper.js";

class AuthService {
    async signupUser(data: SignupDTO) {
        const existingUser = await authRepository.findByEmail(data.email);
        if (existingUser) throw new ApiError("User already exists", 409);

        const user = await authRepository.create({
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            password: data.password,
        });

        return this.issueSession(user.id, user.role, user);
    }

    async loginUser(data: LoginDTO) {
        const user = await authRepository.findByEmail(data.email);
        if (!user) throw new ApiError("Invalid email or password", 401);

        const isValid = await comparePassword(data.password, user.password);
        if (!isValid) throw new ApiError("Invalid email or password", 401);

        if (user.status === "suspended") throw new ApiError("Account is suspended", 403);

        return this.issueSession(user.id, user.role, user);
    }

    async refreshSession(refreshToken: string) {
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            throw new ApiError("Invalid or expired refresh token", 401);
        }

        const user = await authRepository.findById(payload.sub);
        if (!user) throw new ApiError("User not found", 404);

        const tokenHash = hashToken(refreshToken);
        const session = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
        if (!session || session.revokedAt) throw new ApiError("Session revoked", 401);

        await userRepository.revokeRefreshToken(user.id, tokenHash);
        return this.issueSession(user.id, user.role, user);
    }

    async logoutUser(userId: string, refreshToken: string) {
        await userRepository.revokeRefreshToken(userId, hashToken(refreshToken));
    }

    private async issueSession(
        userId: string,
        role: SignupDTO["role"],
        user: Awaited<ReturnType<typeof authRepository.findById>>,
    ) {
        const payload = { sub: userId, role };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await userRepository.addRefreshToken(
            userId,
            hashToken(refreshToken),
            new Date(),
            getTokenExpiry(refreshToken),
        );

        return { user: toUserDTO(user!), accessToken, refreshToken };
    }
}

export const authService = new AuthService();
