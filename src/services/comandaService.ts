import api from "../api/axios";
import type {
    ComandaRequest,
    ComandaResponse,
    ComandaItemRequest,
    FechamentoRequest,
    FechamentoMesaRequest,
    CancelItemRequest,
    SplitComandaRequest,
    TransferItemRequest,
    MergeComandaRequest,
} from "../types";

export interface ComandaFiltros {
    aberta?: boolean;
    mesa?: number;
    inicio?: string;
    fim?: string;
}

export const comandaService = {
    abrir: (data: ComandaRequest) =>
        api.post<ComandaResponse>("/api/comandas/abrir", data),

    buscarPorId: (id: string) =>
        api.get<ComandaResponse>(`/api/comandas/${id}`),

    listar: (filtros?: ComandaFiltros) =>
        api.get<ComandaResponse[]>("/api/comandas", { params: filtros }),

    adicionarItem: (data: ComandaItemRequest) =>
        api.post<ComandaResponse>("/api/comandas/item", data),

    cancelarItem: (itemId: string, data: CancelItemRequest) =>
        api.post<ComandaResponse>(`/api/comandas/item/${itemId}/cancelar`, data),

    removerItem: (itemId: string) =>
        api.delete<ComandaResponse>(`/api/comandas/item/${itemId}`),

    calcular: (id: string) =>
        api.get<ComandaResponse>(`/api/comandas/${id}/calcular`),

    fechar: (id: string, data: FechamentoRequest) =>
        api.post<ComandaResponse>(`/api/comandas/${id}/fechar`, data),

    fecharMesa: (mesa: number, data: FechamentoMesaRequest) =>
        api.post<ComandaResponse[]>(`/api/comandas/mesa/${mesa}/fechar`, data),

    dividir: (id: string, data: SplitComandaRequest) =>
        api.post<ComandaResponse>(`/api/comandas/${id}/dividir`, data),

    transferir: (origemId: string, data: TransferItemRequest) =>
        api.post<ComandaResponse>(`/api/comandas/${origemId}/transferir`, data),

    juntar: (data: MergeComandaRequest) =>
        api.post<ComandaResponse>("/api/comandas/juntar", data),

    reabrir: (id: string) =>
        api.post<ComandaResponse>(`/api/comandas/${id}/reabrir`),
};
