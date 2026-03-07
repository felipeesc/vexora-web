import api from "../api/axios";
import type { MovimentacaoRequest, MovimentacaoResponse } from "../types";

export const movimentacaoService = {
    registrar: (data: MovimentacaoRequest) =>
        api.post<MovimentacaoResponse>("/api/movimentacoes", data),
};
