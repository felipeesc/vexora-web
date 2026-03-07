import api from "../api/axios";
import type {
    FaturamentoDTO,
    ProdutoMaisVendidoDTO,
    RelatorioEstoqueDTO,
    MovimentacaoResponse,
} from "../types";

export const relatorioService = {
    faturamentoDiario: (data?: string) =>
        api.get<FaturamentoDTO>("/api/relatorios/faturamento/diario", { params: { data } }),

    faturamentoSemanal: (data?: string) =>
        api.get<FaturamentoDTO>("/api/relatorios/faturamento/semanal", { params: { data } }),

    faturamentoMensal: (data?: string) =>
        api.get<FaturamentoDTO>("/api/relatorios/faturamento/mensal", { params: { data } }),

    produtosMaisVendidosDia: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/api/relatorios/produtos/mais-vendidos/dia", { params: { data } }),

    produtosMaisVendidosSemana: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/api/relatorios/produtos/mais-vendidos/semana", { params: { data } }),

    produtosMaisVendidosMes: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/api/relatorios/produtos/mais-vendidos/mes", { params: { data } }),

    relatorioEstoque: () =>
        api.get<RelatorioEstoqueDTO>("/api/relatorios/estoque"),

    historicoMovimentacoes: (inicio: string, fim: string) =>
        api.get<MovimentacaoResponse[]>("/api/relatorios/estoque/movimentacoes", {
            params: { inicio, fim },
        }),
};
