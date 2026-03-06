import api from "../api/axios";
import type {
    FaturamentoDTO,
    ProdutoMaisVendidoDTO,
    RelatorioEstoqueDTO,
    MovimentacaoResponse,
} from "../types";

export const relatorioService = {
    faturamentoDiario: (data?: string) =>
        api.get<FaturamentoDTO>("/relatorios/faturamento/diario", { params: { data } }),

    faturamentoSemanal: (data?: string) =>
        api.get<FaturamentoDTO>("/relatorios/faturamento/semanal", { params: { data } }),

    faturamentoMensal: (data?: string) =>
        api.get<FaturamentoDTO>("/relatorios/faturamento/mensal", { params: { data } }),

    produtosMaisVendidosDia: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/dia", { params: { data } }),

    produtosMaisVendidosSemana: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/semana", { params: { data } }),

    produtosMaisVendidosMes: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/mes", { params: { data } }),

    relatorioEstoque: () =>
        api.get<RelatorioEstoqueDTO>("/relatorios/estoque"),

    historicoMovimentacoes: (inicio: string, fim: string) =>
        api.get<MovimentacaoResponse[]>("/relatorios/estoque/movimentacoes", {
            params: { inicio, fim },
        }),
};
