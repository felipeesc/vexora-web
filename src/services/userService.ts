import api from "../api/axios";
import {
    CurrentUserResponse,
    UserResponse,
    CreateUserRequest
} from "../types";

export const userService = {
    getCurrentUser: () =>
        api.get<CurrentUserResponse>("/api/usuarios/me"),

    getAllUsers: () =>
        api.get<UserResponse[]>("/api/usuarios"),

    createUser: (data: CreateUserRequest) =>
        api.post<UserResponse>("/api/usuarios", data),


    updateUser: (id: string, data: CreateUserRequest) =>
        api.put<UserResponse>(`/api/usuarios/${id}`, data),

    deleteUser: (id: string) =>
        api.delete(`/api/usuarios/${id}`),
};
