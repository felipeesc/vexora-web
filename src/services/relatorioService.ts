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

    faturamentoSemanal: () =>
        api.get<FaturamentoDTO>("/relatorios/faturamento/semanal"),

    faturamentoMensal: () =>
        api.get<FaturamentoDTO>("/relatorios/faturamento/mensal"),

    produtosMaisVendidosDia: (data?: string) =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/dia", { params: { data } }),

    produtosMaisVendidosSemana: () =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/semana"),

    produtosMaisVendidosMes: () =>
        api.get<ProdutoMaisVendidoDTO[]>("/relatorios/produtos/mais-vendidos/mes"),

    relatorioEstoque: () =>
        api.get<RelatorioEstoqueDTO>("/relatorios/estoque"),

    historicoMovimentacoes: (inicio: string, fim: string) =>
        api.get<MovimentacaoResponse[]>("/relatorios/estoque/movimentacoes", {
            params: { inicio, fim },
        }),
};
