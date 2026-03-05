/* ==================== ENUMS ==================== */

export enum CategoriaProduto {
    CERVEJA = "CERVEJA",
    REFRIGERANTE = "REFRIGERANTE",
    DESTILADO = "DESTILADO",
    ENERGETICO = "ENERGETICO",
    GELO = "GELO",
    PETISCO = "PETISCO",
    VINHO = "VINHO",
    SUCO = "SUCO",
    AGUA = "AGUA",
    OUTROS = "OUTROS",
}

export enum UnidadeMedida {
    UNIDADE = "UNIDADE",
    LATA = "LATA",
    GARRAFA = "GARRAFA",
    CAIXA = "CAIXA",
    KG = "KG",
    PACOTE = "PACOTE",
}

export enum TipoMovimentacao {
    ENTRADA = "ENTRADA",
    SAIDA = "SAIDA",
}

export enum Role {
    ROLE_ADMIN = "ROLE_ADMIN",
    ROLE_USER = "ROLE_USER",
}

/* ==================== AUTH ==================== */

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface SignupRequest {
    username: string;
    password: string;
    role?: Role;
}

/* ==================== PRODUTO ==================== */

export interface ProdutoRequest {
    nome: string;
    categoria: CategoriaProduto;
    unidade: UnidadeMedida;
    precoCompra: number;
    precoVenda: number;
    estoqueAtual: number;
    estoqueMinimo: number;
}

export interface ProdutoResponse {
    id: string;
    nome: string;
    categoria: CategoriaProduto;
    unidade: UnidadeMedida;
    precoCompra: number;
    precoVenda: number;
    estoqueAtual: number;
    estoqueMinimo: number;
}

/* ==================== COMANDA ==================== */

export interface ComandaRequest {
    mesa: number;
    identificador?: string;
    cliente?: string;
}

export interface ComandaItemRequest {
    comandaId: string;
    produtoId: string;
    quantidade: number;
}

export interface ComandaItemDTO {
    id: string;
    nome: string;
    categoria: CategoriaProduto;
    unidade: UnidadeMedida;
    quantidade: number;
    dataHora: string;
    precoUnitario: number;
    totalItem: number;
}

export interface ComandaResponse {
    id: string;
    mesa: number;
    cliente: string | null;
    aberta: boolean;
    abertura: string;
    fechamento: string | null;
    itens: ComandaItemDTO[];
    total: number;
}

/* ==================== MOVIMENTAÇÃO ==================== */

export interface MovimentacaoRequest {
    produtoId: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    motivo?: string;
}

export interface MovimentacaoResponse {
    id: number;
    produtoNome: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    motivo: string | null;
    dataHora: string;
}

/* ==================== RELATÓRIOS ==================== */

export interface FaturamentoDTO {
    faturamentoBruto: number;
    faturamentoLiquido: number;
}

export interface ProdutoMaisVendidoDTO {
    produto: string;
    quantidadeVendida: number;
    estoqueAtual: number;
}

export interface EstoqueProdutoDTO {
    id: string;
    nome: string;
    categoria: CategoriaProduto;
    unidade: UnidadeMedida;
    estoqueAtual: number;
    estoqueMinimo: number;
    abaixoDoMinimo: boolean;
}

export interface RelatorioEstoqueDTO {
    totalProdutos: number;
    produtosAbaixoDoMinimo: number;
    produtos: EstoqueProdutoDTO[];
}
