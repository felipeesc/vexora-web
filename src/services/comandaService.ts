import api from "../api/axios";
import type {
    ComandaRequest,
    ComandaResponse,
    ComandaItemRequest,
} from "../types";

export interface ComandaFiltros {
    aberta?: boolean;
    mesa?: number;
    inicio?: string;
    fim?: string;
}

export const comandaService = {
    abrir: (data: ComandaRequest) =>
        api.post<ComandaResponse>("/comandas/abrir", data),

    buscarPorId: (id: string) =>
        api.get<ComandaResponse>(`/comandas/${id}`),

    listar: (filtros?: ComandaFiltros) =>
        api.get<ComandaResponse[]>("/comandas", { params: filtros }),

    adicionarItem: (data: ComandaItemRequest) =>
        api.post<ComandaResponse>("/comandas/item", data),

    removerItem: (itemId: string) =>
        api.delete<ComandaResponse>(`/comandas/item/${itemId}`),

    calcular: (id: string) =>
        api.get<ComandaResponse>(`/comandas/${id}/calcular`),

    fechar: (id: string) =>
        api.post<ComandaResponse>(`/comandas/${id}/fechar`),
};
