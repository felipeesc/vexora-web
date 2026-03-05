import api from "../api/axios";
import type { ProdutoRequest, ProdutoResponse } from "../types";
export const produtoService = {
    listar: () =>
        api.get<ProdutoResponse[]>("/produtos"),
    buscarPorId: (id: string) =>
        api.get<ProdutoResponse>(`/produtos/${id}`),
    criar: (data: ProdutoRequest) =>
        api.post<ProdutoResponse>("/produtos", data),
    atualizar: (id: string, data: ProdutoRequest) =>
        api.put<ProdutoResponse>(`/produtos/${id}`, data),
    deletar: (id: string) =>
        api.delete(`/produtos/${id}`),
};
