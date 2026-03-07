import api from "../api/axios";
import {
    CategoriaRequest,
    CategoriaResponse
} from "../types";

export const categoriaService = {
    listar: () =>
        api.get<CategoriaResponse[]>("/api/categorias"),

    listarTodas: () =>
        api.get<CategoriaResponse[]>("/api/categorias/todas"),

    criar: (data: CategoriaRequest) =>
        api.post<CategoriaResponse>("/api/categorias", data),

    obterPorId: (id: string) =>
        api.get<CategoriaResponse>(`/api/categorias/${id}`),

    atualizar: (id: string, data: CategoriaRequest) =>
        api.put<CategoriaResponse>(`/api/categorias/${id}`, data),

    deletar: (id: string) =>
        api.delete(`/api/categorias/${id}`),
};
