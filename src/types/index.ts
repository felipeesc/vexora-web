// Arquivo de tipos para o sistema Vexora
// Todas as interfaces e enums estão exportados explicitamente

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
    ADMIN = "ADMIN",
    GERENTE = "GERENTE",
    FUNCIONARIO = "FUNCIONARIO",
}

export enum MetodoPagamento {
    DINHEIRO = "DINHEIRO",
    DEBITO = "DEBITO",
    CREDITO = "CREDITO",
    PIX = "PIX",
}

/* ==================== INTERFACES DE AUTENTICAÇÃO ==================== */

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role?: string;
    username?: string;
}

export interface CurrentUserResponse {
    id: string;
    username: string;
    role: Role;
    enabled: boolean;
}

export interface UserResponse {
    id: string;
    username: string;
    role: Role;
    enabled: boolean;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    role: Role;
}

export interface SignupRequest {
    username: string;
    password: string;
    role?: Role;
}

/* ==================== INTERFACES DE CATEGORIA ==================== */

export interface CategoriaRequest {
    nome: string;
    descricao?: string;
}

export interface CategoriaResponse {
    id: string;
    nome: string;
    descricao?: string;
    ativa: boolean;
    criadoEm: string;
}

/* ==================== INTERFACES DE PRODUTO ==================== */

export interface ProdutoRequest {
    nome: string;
    categoriaId: string;
    unidade: UnidadeMedida;
    precoCompra: number;
    precoVenda: number;
    estoqueAtual: number;
    estoqueMinimo: number;
}

export interface ProdutoResponse {
    id: string;
    nome: string;
    categoria: CategoriaResponse;
    unidade: UnidadeMedida;
    precoCompra: number;
    precoVenda: number;
    estoqueAtual: number;
    estoqueMinimo: number;
}

/* ==================== INTERFACES DE COMANDA ==================== */

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
    cancelado: boolean;
    motivoCancelamento: string | null;
}

export interface PagamentoDTO {
    metodo: MetodoPagamento;
    valor: number;
}

export interface PagamentoResponse {
    id: number;
    metodo: MetodoPagamento;
    valor: number;
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
    pagamentos: PagamentoResponse[];
}

/* ==================== INTERFACES DE MOVIMENTAÇÃO ==================== */

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
    usuario: string | null;
    dataHora: string;
}

/* ==================== INTERFACES DE RELATÓRIOS ==================== */

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
    categoria: CategoriaResponse;
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
