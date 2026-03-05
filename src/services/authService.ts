import api from "../api/axios";
import type { LoginRequest, LoginResponse, SignupRequest } from "../types";

export const authService = {
    login: (data: LoginRequest) =>
        api.post<LoginResponse>("/auth/login", data),

    signup: (data: SignupRequest) =>
        api.post("/auth/signup", data),
};
