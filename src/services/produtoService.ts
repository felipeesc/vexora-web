import api from "../api/axios";
import type { ProdutoRequest, ProdutoResponse } from "../types";

export const produtoService = {
    listar: () =>
        api.get<ProdutoResponse[]>("/api/produtos"),

    buscarPorId: (id: string) =>
        api.get<ProdutoResponse>(`/api/produtos/${id}`),

    criar: (data: ProdutoRequest) =>
        api.post<ProdutoResponse>("/api/produtos", data),

    atualizar: (id: string, data: ProdutoRequest) =>
        api.put<ProdutoResponse>(`/api/produtos/${id}`, data),

    deletar: (id: string) =>
        api.delete(`/api/produtos/${id}`),
};
