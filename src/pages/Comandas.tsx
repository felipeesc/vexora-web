import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    IconButton,
    Divider,
    Autocomplete,
    InputAdornment,
    Tooltip,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import {
    Add,
    CheckCircleOutline,
    Delete,
    AddCircleOutline,
    Visibility,
    PointOfSale,
    ShoppingCart,
    AccessTime,
    MonetizationOn,
    TableRestaurant,
    Search,
    Group,
    ArrowBack,
    Payment,
    CallSplit,
    MergeType,
    SwapHoriz,
    Cancel,
    Replay,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { comandaService } from "../services/comandaService";
import { produtoService } from "../services/produtoService";
import { formatBRL } from "../utils/format";
import { MetodoPagamento } from "../types";
import type { ComandaResponse, ProdutoResponse, PagamentoDTO } from "../types";

interface CartItem {
    produtoId: string;
    nome: string;
    precoVenda: number;
    quantidade: number;
}

interface MesaGroup {
    mesa: number;
    comandas: ComandaResponse[];
    totalMesa: number;
    totalItens: number;
}

export default function Comandas() {

    const [comandas, setComandas] = useState<ComandaResponse[]>([]);
    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("");

    // Modal states
    const [openNova, setOpenNova] = useState(false);
    const [openLancar, setOpenLancar] = useState(false);
    const [openFechar, setOpenFechar] = useState(false);
    const [openDetalhes, setOpenDetalhes] = useState(false);

    // Form states
    const [mesa, setMesa] = useState<number | "">("");
    const [cliente, setCliente] = useState("");
    const [comandaAtiva, setComandaAtiva] = useState<ComandaResponse | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Lançar múltiplos itens (carrinho)
    const [itensLancar, setItensLancar] = useState<CartItem[]>([]);
    const [novoProdutoId, setNovoProdutoId] = useState("");
    const [novaQuantidade, setNovaQuantidade] = useState<number>(1);

    // Visualização da mesa (quando tem múltiplas comandas)
    const [mesaSelecionada, setMesaSelecionada] = useState<MesaGroup | null>(null);

    // Pagamento
    const [pagamentos, setPagamentos] = useState<PagamentoDTO[]>([]);
    const [novoMetodo, setNovoMetodo] = useState<MetodoPagamento>(MetodoPagamento.PIX);
    const [novoValorPag, setNovoValorPag] = useState<number | "">("");
    const [fecharMesaMode, setFecharMesaMode] = useState(false);

    // Cancel item
    const [openCancelar, setOpenCancelar] = useState(false);
    const [cancelItemId, setCancelItemId] = useState("");
    const [cancelMotivo, setCancelMotivo] = useState("");

    // Dividir comanda
    const [openDividir, setOpenDividir] = useState(false);
    const [splitItemIds, setSplitItemIds] = useState<string[]>([]);
    const [splitCliente, setSplitCliente] = useState("");

    // Transferir itens
    const [openTransferir, setOpenTransferir] = useState(false);
    const [transferItemIds, setTransferItemIds] = useState<string[]>([]);
    const [transferDestinoId, setTransferDestinoId] = useState("");

    // Juntar comandas
    const [openJuntar, setOpenJuntar] = useState(false);
    const [mergeIds, setMergeIds] = useState<string[]>([]);

    const { enqueueSnackbar } = useSnackbar(); // true = fechar todas da mesa

    /* ===================== FETCH ===================== */

    const fetchComandas = useCallback(async () => {
        try {
            const { data } = await comandaService.listar({ aberta: true });
            setComandas(data);
        } catch {
            setError("Erro ao carregar comandas");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProdutos = useCallback(async () => {
        try {
            const { data } = await produtoService.listar();
            setProdutos(data);
        } catch {
            /* silent */
        }
    }, []);

    useEffect(() => {
        fetchComandas();
        fetchProdutos();
    }, [fetchComandas, fetchProdutos]);

    /* ===================== DERIVED ===================== */

    const totalAberto = comandas.reduce((a, c) => a + c.total, 0);

    // Agrupar comandas por mesa
    const mesasAgrupadas: MesaGroup[] = (() => {
        const map = new Map<number, ComandaResponse[]>();
        comandas.forEach((c) => {
            const grupo = map.get(c.mesa) || [];
            grupo.push(c);
            map.set(c.mesa, grupo);
        });
        return Array.from(map.entries())
            .map(([mesa, comandas]) => ({
                mesa,
                comandas,
                totalMesa: comandas.reduce((a, c) => a + c.total, 0),
                totalItens: comandas.reduce((a, c) => a + c.itens.length, 0),
            }))
            .sort((a, b) => a.mesa - b.mesa);
    })();

    const mesasOcupadas = mesasAgrupadas.length;

    const mesasFiltradas = mesasAgrupadas.filter(
        (g) =>
            String(g.mesa).includes(filtro) ||
            g.comandas.some((c) =>
                (c.cliente || "").toLowerCase().includes(filtro.toLowerCase())
            )
    );

    const produtoSelecionado = produtos.find((p) => p.id === novoProdutoId);
    const totalCarrinho = itensLancar.reduce((a, i) => a + i.precoVenda * i.quantidade, 0);

    /* ===================== HANDLERS ===================== */

    const handleClickMesa = (grupo: MesaGroup) => {
        if (grupo.comandas.length === 1) {
            // Mesa com 1 comanda: abre detalhes direto
            handleVerDetalhes(grupo.comandas[0]);
        } else {
            // Mesa com múltiplas comandas: abre visão da mesa
            setMesaSelecionada(grupo);
        }
    };

    const handleAbrirComanda = async () => {
        if (!mesa) return;
        try {
            setActionLoading(true);
            await comandaService.abrir({ mesa: Number(mesa), cliente: cliente || undefined });
            setOpenNova(false);
            setMesa("");
            setCliente("");
            await fetchComandas();
            enqueueSnackbar("Comanda aberta com sucesso", { variant: "success" });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao abrir comanda");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdicionarAoCarrinho = () => {
        if (!produtoSelecionado || novaQuantidade < 1) return;

        setItensLancar((prev) => {
            const existente = prev.find((i) => i.produtoId === produtoSelecionado.id);
            if (existente) {
                return prev.map((i) =>
                    i.produtoId === produtoSelecionado.id
                        ? { ...i, quantidade: i.quantidade + novaQuantidade }
                        : i
                );
            }
            return [
                ...prev,
                {
                    produtoId: produtoSelecionado.id,
                    nome: produtoSelecionado.nome,
                    precoVenda: produtoSelecionado.precoVenda,
                    quantidade: novaQuantidade,
                },
            ];
        });

        setNovoProdutoId("");
        setNovaQuantidade(1);
    };

    const handleRemoverDoCarrinho = (produtoId: string) => {
        setItensLancar((prev) => prev.filter((i) => i.produtoId !== produtoId));
    };

    const handleEnviarItens = async () => {
        if (!comandaAtiva || itensLancar.length === 0) return;
        try {
            setActionLoading(true);
            for (const item of itensLancar) {
                await comandaService.adicionarItem({
                    comandaId: comandaAtiva.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                });
            }
            setOpenLancar(false);
            setItensLancar([]);
            setNovoProdutoId("");
            setNovaQuantidade(1);
            enqueueSnackbar("Itens lançados com sucesso", { variant: "success" });
            await fetchComandas();
            // Atualizar a mesa selecionada se estiver aberta
            if (mesaSelecionada) {
                const { data } = await comandaService.listar({ aberta: true, mesa: mesaSelecionada.mesa });
                const totalMesa = data.reduce((a: number, c: ComandaResponse) => a + c.total, 0);
                const totalItens = data.reduce((a: number, c: ComandaResponse) => a + c.itens.length, 0);
                setMesaSelecionada({ mesa: mesaSelecionada.mesa, comandas: data, totalMesa, totalItens });
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao lançar itens");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoverItem = (itemId: string) => {
        openCancelarItem(itemId);
    };

    const handleFecharComanda = async () => {
        if (!comandaAtiva && !fecharMesaMode) return;

        const totalConta = fecharMesaMode && mesaSelecionada
            ? mesaSelecionada.totalMesa
            : (comandaAtiva?.total || 0);

        const totalPago = pagamentos.reduce((a, p) => a + p.valor, 0);
        if (Math.abs(totalPago - totalConta) > 0.01) {
            setError("O valor pago não corresponde ao total da conta");
            return;
        }

        try {
            setActionLoading(true);
            if (fecharMesaMode && mesaSelecionada) {
                await comandaService.fecharMesa(mesaSelecionada.mesa, { pagamentos });
                setMesaSelecionada(null);
            } else if (comandaAtiva) {
                await comandaService.fechar(comandaAtiva.id, { pagamentos });
                // Atualizar visão da mesa se estiver aberta
                if (mesaSelecionada) {
                    const { data } = await comandaService.listar({ aberta: true, mesa: mesaSelecionada.mesa });
                    if (data.length === 0) {
                        setMesaSelecionada(null);
                    } else {
                        const totalMesa = data.reduce((a: number, c: ComandaResponse) => a + c.total, 0);
                        const totalItens = data.reduce((a: number, c: ComandaResponse) => a + c.itens.length, 0);
                        setMesaSelecionada({ mesa: mesaSelecionada.mesa, comandas: data, totalMesa, totalItens });
                    }
                }
            }
            setOpenFechar(false);
            setComandaAtiva(null);
            setPagamentos([]);
            setFecharMesaMode(false);
            enqueueSnackbar(
                fecharMesaMode ? "Mesa fechada com sucesso" : "Comanda fechada com sucesso",
                { variant: "success" }
            );
            await fetchComandas();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao fechar comanda");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdicionarPagamento = () => {
        if (!novoValorPag || novoValorPag <= 0) return;
        setPagamentos((prev) => [...prev, { metodo: novoMetodo, valor: novoValorPag }]);
        setNovoValorPag("");
    };

    const handleRemoverPagamento = (index: number) => {
        setPagamentos((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePreencherRestante = () => {
        const totalConta = fecharMesaMode && mesaSelecionada
            ? mesaSelecionada.totalMesa
            : (comandaAtiva?.total || 0);
        const totalPago = pagamentos.reduce((a, p) => a + p.valor, 0);
        const restante = totalConta - totalPago;
        if (restante > 0) {
            setNovoValorPag(parseFloat(restante.toFixed(2)));
        }
    };

    const openFecharComanda = (c: ComandaResponse) => {
        setComandaAtiva(c);
        setFecharMesaMode(false);
        setPagamentos([]);
        setNovoMetodo(MetodoPagamento.PIX);
        setNovoValorPag("");
        setOpenFechar(true);
    };

    const openFecharMesa = () => {
        if (!mesaSelecionada) return;
        setComandaAtiva(null);
        setFecharMesaMode(true);
        setPagamentos([]);
        setNovoMetodo(MetodoPagamento.PIX);
        setNovoValorPag("");
        setOpenFechar(true);
    };

    const METODO_LABELS: Record<MetodoPagamento, string> = {
        [MetodoPagamento.DINHEIRO]: "💵 Dinheiro",
        [MetodoPagamento.DEBITO]: "💳 Débito",
        [MetodoPagamento.CREDITO]: "💳 Crédito",
        [MetodoPagamento.PIX]: "📱 Pix",
    };

    /* ---- Cancel Item ---- */
    const handleCancelarItem = async () => {
        if (!cancelItemId || !cancelMotivo.trim()) return;
        try {
            setActionLoading(true);
            await comandaService.cancelarItem(cancelItemId, { motivo: cancelMotivo });
            enqueueSnackbar("Item cancelado com sucesso", { variant: "success" });
            setOpenCancelar(false);
            setCancelItemId("");
            setCancelMotivo("");
            if (comandaAtiva) {
                const { data } = await comandaService.buscarPorId(comandaAtiva.id);
                setComandaAtiva(data);
            }
            await fetchComandas();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Erro ao cancelar item", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const openCancelarItem = (itemId: string) => {
        setCancelItemId(itemId);
        setCancelMotivo("");
        setOpenCancelar(true);
    };

    /* ---- Dividir Comanda ---- */
    const handleDividirComanda = async () => {
        if (!comandaAtiva || splitItemIds.length === 0) return;
        try {
            setActionLoading(true);
            await comandaService.dividir(comandaAtiva.id, {
                itemIds: splitItemIds,
                cliente: splitCliente || undefined,
            });
            enqueueSnackbar("Comanda dividida com sucesso", { variant: "success" });
            setOpenDividir(false);
            setOpenDetalhes(false);
            setSplitItemIds([]);
            setSplitCliente("");
            await fetchComandas();
            await refreshMesaSelecionada();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Erro ao dividir comanda", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    /* ---- Transferir Itens ---- */
    const handleTransferirItens = async () => {
        if (!comandaAtiva || transferItemIds.length === 0 || !transferDestinoId) return;
        try {
            setActionLoading(true);
            await comandaService.transferir(comandaAtiva.id, {
                itemIds: transferItemIds,
                comandaDestinoId: transferDestinoId,
            });
            enqueueSnackbar("Itens transferidos com sucesso", { variant: "success" });
            setOpenTransferir(false);
            setOpenDetalhes(false);
            setTransferItemIds([]);
            setTransferDestinoId("");
            await fetchComandas();
            await refreshMesaSelecionada();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Erro ao transferir itens", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    /* ---- Juntar Comandas ---- */
    const handleJuntarComandas = async () => {
        if (mergeIds.length < 2) return;
        try {
            setActionLoading(true);
            await comandaService.juntar({ comandaIds: mergeIds });
            enqueueSnackbar("Comandas unificadas com sucesso", { variant: "success" });
            setOpenJuntar(false);
            setMergeIds([]);
            await fetchComandas();
            await refreshMesaSelecionada();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Erro ao juntar comandas", { variant: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    /* ---- Refresh mesa selecionada ---- */
    const refreshMesaSelecionada = async () => {
        if (!mesaSelecionada) return;
        const { data } = await comandaService.listar({ aberta: true, mesa: mesaSelecionada.mesa });
        if (data.length === 0) {
            setMesaSelecionada(null);
        } else {
            const totalMesa = data.reduce((a: number, c: ComandaResponse) => a + c.total, 0);
            const totalItens = data.reduce((a: number, c: ComandaResponse) => a + c.itens.length, 0);
            setMesaSelecionada({ mesa: mesaSelecionada.mesa, comandas: data, totalMesa, totalItens });
        }
    };

    const handleVerDetalhes = async (c: ComandaResponse) => {
        try {
            const { data } = await comandaService.buscarPorId(c.id);
            setComandaAtiva(data);
            setOpenDetalhes(true);
        } catch {
            setError("Erro ao carregar detalhes");
        }
    };

    /* ===================== COMANDA CARD (reutilizável) ===================== */

    const ComandaCard = ({ c, compact }: { c: ComandaResponse; compact?: boolean }) => (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s",
                "&:hover": { boxShadow: 4, borderColor: "primary.main" },
            }}
        >
            <Box
                sx={{
                    bgcolor: "primary.dark",
                    color: "white",
                    px: 2,
                    py: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <PointOfSale sx={{ fontSize: 18 }} />
                    <Typography fontWeight={700} fontSize={14}>
                        {compact ? (c.cliente || "Sem cliente") : `Mesa ${c.mesa}`}
                    </Typography>
                </Box>
                <Chip
                    icon={<AccessTime sx={{ fontSize: 13, color: "inherit !important" }} />}
                    label={c.abertura
                        ? new Date(c.abertura).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                        : "Aberta"
                    }
                    size="small"
                    sx={{
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 11,
                        height: 22,
                    }}
                />
            </Box>

            <Box sx={{ p: 2 }}>
                {!compact && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography fontWeight={600} fontSize={13} color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                            {c.cliente || "Sem cliente"}
                        </Typography>
                        <Chip
                            icon={<ShoppingCart sx={{ fontSize: 13 }} />}
                            label={`${c.itens.length} ${c.itens.length === 1 ? "item" : "itens"}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
                        />
                    </Box>
                )}
                {compact && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                        <Chip
                            icon={<ShoppingCart sx={{ fontSize: 13 }} />}
                            label={`${c.itens.length} ${c.itens.length === 1 ? "item" : "itens"}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
                        />
                    </Box>
                )}

                <Typography fontWeight={800} fontSize={24} color="error.main" sx={{ mb: 1.5 }}>
                    {formatBRL(c.total)}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.8 }}>
                    <Tooltip title="Ver detalhes">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleVerDetalhes(c)}
                            sx={{
                                flex: 1,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 12,
                                borderColor: "divider",
                                color: "text.secondary",
                                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                            }}
                        >
                            <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                            Detalhes
                        </Button>
                    </Tooltip>
                    <Tooltip title="Lançar consumo">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                setComandaAtiva(c);
                                setItensLancar([]);
                                setNovoProdutoId("");
                                setNovaQuantidade(1);
                                setOpenLancar(true);
                            }}
                            sx={{ flex: 1, textTransform: "none", fontWeight: 600, fontSize: 12 }}
                        >
                            <Add sx={{ fontSize: 16, mr: 0.5 }} />
                            Lançar
                        </Button>
                    </Tooltip>
                    <Tooltip title="Fechar comanda">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => openFecharComanda(c)}
                            sx={{ flex: 1, textTransform: "none", fontWeight: 600, fontSize: 12 }}
                        >
                            <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} />
                            Fechar
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
        </Paper>
    );

    /* ===================== UI ===================== */

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    // ========== VISÃO DA MESA (múltiplas comandas) ==========
    if (mesaSelecionada) {
        return (
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <IconButton onClick={() => setMesaSelecionada(null)}>
                        <ArrowBack />
                    </IconButton>
                    <TableRestaurant color="primary" />
                    <Typography variant="h4" fontWeight={700}>
                        Mesa {mesaSelecionada.mesa}
                    </Typography>
                    <Chip
                        label={`${mesaSelecionada.comandas.length} comandas`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 700, ml: 1 }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                {/* Resumo da mesa */}
                <Paper sx={{ p: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ bgcolor: "error.main", borderRadius: 2, p: 1, display: "flex" }}>
                        <MonetizationOn sx={{ color: "white" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            TOTAL DA MESA
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="error.main">
                            {formatBRL(mesaSelecionada.totalMesa)}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            setMesa(mesaSelecionada.mesa);
                            setOpenNova(true);
                        }}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Nova Comanda
                    </Button>
                    {mesaSelecionada.comandas.length > 1 && (
                        <>
                            <Tooltip title="Unificar comandas selecionadas">
                                <Button
                                    variant="outlined"
                                    startIcon={<MergeType />}
                                    onClick={() => {
                                        setMergeIds([]);
                                        setOpenJuntar(true);
                                    }}
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    Juntar
                                </Button>
                            </Tooltip>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Payment />}
                                onClick={openFecharMesa}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Fechar Todas ({formatBRL(mesaSelecionada.totalMesa)})
                            </Button>
                        </>
                    )}
                </Paper>

                {/* Cards das comandas da mesa */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                        gap: 2.5,
                    }}
                >
                    {mesaSelecionada.comandas.map((c) => (
                        <ComandaCard key={c.id} c={c} compact />
                    ))}
                </Box>

                {/* Todos os modais ficam aqui também */}
                {renderModais()}
            </Box>
        );
    }

    // ========== VISÃO PRINCIPAL (agrupada por mesa) ==========
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>
                Comandas
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* RESUMO */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ bgcolor: "error.main", borderRadius: 2, p: 1, display: "flex" }}>
                        <MonetizationOn sx={{ color: "white" }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            TOTAL EM ABERTO
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="error.main">
                            {formatBRL(totalAberto)}
                        </Typography>
                    </Box>
                </Paper>
                <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ bgcolor: "warning.main", borderRadius: 2, p: 1, display: "flex" }}>
                        <TableRestaurant sx={{ color: "white" }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            MESAS OCUPADAS
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="warning.main">
                            {mesasOcupadas}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* FILTRO + NOVA COMANDA */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                    placeholder="Filtrar por cliente ou mesa..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 220 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenNova(true)}
                    sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
                >
                    Nova Comanda
                </Button>
            </Box>

            {/* CARDS AGRUPADOS POR MESA */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                    gap: 2.5,
                }}
            >
                {mesasFiltradas.map((grupo) => {
                    // Mesa com 1 comanda: card direto
                    if (grupo.comandas.length === 1) {
                        return <ComandaCard key={grupo.mesa} c={grupo.comandas[0]} />;
                    }

                    // Mesa com múltiplas comandas: card agrupado
                    return (
                        <Paper
                            key={grupo.mesa}
                            elevation={0}
                            onClick={() => handleClickMesa(grupo)}
                            sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                border: "1px solid",
                                borderColor: "divider",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": { boxShadow: 4, borderColor: "warning.main" },
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    background: (t) =>
                                        `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.warning.main} 100%)`,
                                    color: "white",
                                    px: 2,
                                    py: 1.2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                    <TableRestaurant sx={{ fontSize: 18 }} />
                                    <Typography fontWeight={700} fontSize={14}>
                                        Mesa {grupo.mesa}
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<Group sx={{ fontSize: 13, color: "inherit !important" }} />}
                                    label={`${grupo.comandas.length} comandas`}
                                    size="small"
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        color: "white",
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                    }}
                                />
                            </Box>

                            {/* Body */}
                            <Box sx={{ p: 2 }}>
                                {/* Nomes dos clientes */}
                                <Box sx={{ mb: 1.5 }}>
                                    {grupo.comandas.slice(0, 3).map((c) => (
                                        <Typography key={c.id} fontSize={12} color="text.secondary" noWrap>
                                            • {c.cliente || "Sem cliente"}
                                        </Typography>
                                    ))}
                                    {grupo.comandas.length > 3 && (
                                        <Typography fontSize={12} color="text.disabled">
                                            +{grupo.comandas.length - 3} mais...
                                        </Typography>
                                    )}
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                    <Box>
                                        <Typography fontWeight={800} fontSize={24} color="error.main">
                                            {formatBRL(grupo.totalMesa)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {grupo.totalItens} itens no total
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            fontSize: 12,
                                        }}
                                    >
                                        Ver mesa →
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    );
                })}

                {mesasFiltradas.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: "center", gridColumn: "1 / -1" }}>
                        <Typography color="text.secondary">
                            Nenhuma comanda aberta encontrada.
                        </Typography>
                    </Paper>
                )}
            </Box>

            {renderModais()}
        </Box>
    );

    /* ===================== MODAIS (extraídos para reusar) ===================== */

    function renderModais() {
        return (
            <>
                {/* MODAL NOVA COMANDA */}
                <Dialog open={openNova} onClose={() => setOpenNova(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Nova Comanda</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                        <TextField
                            label="Número da Mesa"
                            type="number"
                            value={mesa}
                            onChange={(e) => setMesa(e.target.value ? Number(e.target.value) : "")}
                            inputProps={{ min: 1 }}
                            fullWidth
                        />
                        <TextField
                            label="Cliente (opcional)"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenNova(false)}>Cancelar</Button>
                        <Button variant="contained" onClick={handleAbrirComanda} disabled={!mesa || actionLoading}>
                            {actionLoading ? "Abrindo..." : "Abrir Comanda"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL LANÇAR — CARRINHO */}
                <Dialog open={openLancar} onClose={() => setOpenLancar(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Lançar Consumo — Mesa {comandaAtiva?.mesa}{comandaAtiva?.cliente ? ` — ${comandaAtiva.cliente}` : ""}</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>

                        {/* Adicionar item ao carrinho */}
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                            <Autocomplete
                                options={produtos}
                                getOptionLabel={(p) => `${p.nome} — ${formatBRL(p.precoVenda)}`}
                                value={produtos.find((p) => p.id === novoProdutoId) || null}
                                onChange={(_, selected) => setNovoProdutoId(selected?.id || "")}
                                renderInput={(params) => (
                                    <TextField {...params} label="Buscar produto" size="small" />
                                )}
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                noOptionsText="Nenhum produto encontrado"
                                sx={{ flex: 2 }}
                            />
                            <TextField
                                type="number"
                                label="Qtd"
                                value={novaQuantidade}
                                onChange={(e) => setNovaQuantidade(Number(e.target.value))}
                                inputProps={{ min: 1 }}
                                sx={{ width: 80 }}
                                size="small"
                            />
                            <IconButton
                                color="primary"
                                onClick={handleAdicionarAoCarrinho}
                                disabled={!novoProdutoId || novaQuantidade < 1}
                            >
                                <AddCircleOutline />
                            </IconButton>
                        </Box>

                        {/* Lista do carrinho */}
                        {itensLancar.length > 0 && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Itens a lançar ({itensLancar.length})
                                </Typography>
                                {itensLancar.map((item) => (
                                    <Paper
                                        key={item.produtoId}
                                        variant="outlined"
                                        sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={600} fontSize={14}>
                                                {item.nome}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.quantidade}x {formatBRL(item.precoVenda)}
                                            </Typography>
                                        </Box>
                                        <Typography fontWeight={700} fontSize={14}>
                                            {formatBRL(item.precoVenda * item.quantidade)}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoverDoCarrinho(item.produtoId)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                ))}
                                <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                                    <Typography variant="caption" color="text.secondary">
                                        TOTAL DO LANÇAMENTO
                                    </Typography>
                                    <Typography fontWeight={700} fontSize={18}>
                                        {formatBRL(totalCarrinho)}
                                    </Typography>
                                </Paper>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLancar(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleEnviarItens}
                            disabled={itensLancar.length === 0 || actionLoading}
                        >
                            {actionLoading ? "Lançando..." : `Confirmar (${itensLancar.length} itens)`}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL FECHAR — PAGAMENTO */}
                <Dialog open={openFechar} onClose={() => setOpenFechar(false)} fullWidth maxWidth="sm">
                    <Box sx={{ bgcolor: "success.main", color: "white", px: 3, py: 2 }}>
                        <Typography fontWeight={700} fontSize={18}>
                            {fecharMesaMode
                                ? `Fechar Mesa ${mesaSelecionada?.mesa} — ${mesaSelecionada?.comandas.length} comandas`
                                : `Fechar Comanda — Mesa ${comandaAtiva?.mesa}`}
                        </Typography>
                        {!fecharMesaMode && comandaAtiva?.cliente && (
                            <Typography fontSize={13} sx={{ opacity: 0.85 }}>
                                {comandaAtiva.cliente}
                            </Typography>
                        )}
                    </Box>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>

                        {/* Resumo das comandas (modo mesa) */}
                        {fecharMesaMode && mesaSelecionada && (
                            <Paper variant="outlined" sx={{ p: 1.5 }}>
                                {mesaSelecionada.comandas.map((c) => (
                                    <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography fontSize={13} color="text.secondary">
                                            {c.cliente || "Sem cliente"} ({c.itens.length} itens)
                                        </Typography>
                                        <Typography fontSize={13} fontWeight={600}>
                                            {formatBRL(c.total)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        )}

                        {/* Total */}
                        <Paper sx={{ p: 2, bgcolor: "background.default", borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                TOTAL DA CONTA
                            </Typography>
                            <Typography fontSize={28} fontWeight={900} color="error.main">
                                {formatBRL(
                                    fecharMesaMode && mesaSelecionada
                                        ? mesaSelecionada.totalMesa
                                        : (comandaAtiva?.total || 0)
                                )}
                            </Typography>
                        </Paper>

                        <Divider />

                        {/* Adicionar pagamento */}
                        <Typography variant="subtitle2" color="text.secondary">
                            <Payment sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                            Formas de pagamento
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                            <TextField
                                select
                                label="Método"
                                value={novoMetodo}
                                onChange={(e) => setNovoMetodo(e.target.value as MetodoPagamento)}
                                size="small"
                                sx={{ width: 160 }}
                            >
                                {Object.values(MetodoPagamento).map((m) => (
                                    <MenuItem key={m} value={m}>{METODO_LABELS[m]}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                type="number"
                                label="Valor (R$)"
                                value={novoValorPag}
                                onChange={(e) => setNovoValorPag(e.target.value ? Number(e.target.value) : "")}
                                inputProps={{ min: 0.01, step: 0.01 }}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Tooltip title="Preencher valor restante">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={handlePreencherRestante}
                                    sx={{ mb: 0.3 }}
                                >
                                    <MonetizationOn fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                color="primary"
                                onClick={handleAdicionarPagamento}
                                disabled={!novoValorPag || novoValorPag <= 0}
                            >
                                <AddCircleOutline />
                            </IconButton>
                        </Box>

                        {/* Lista de pagamentos adicionados */}
                        {pagamentos.length > 0 && (
                            <>
                                {pagamentos.map((pag, idx) => (
                                    <Paper
                                        key={idx}
                                        variant="outlined"
                                        sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <Chip
                                            label={METODO_LABELS[pag.metodo]}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontWeight: 600 }}
                                        />
                                        <Box sx={{ flex: 1 }} />
                                        <Typography fontWeight={700} fontSize={14}>
                                            {formatBRL(pag.valor)}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoverPagamento(idx)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                ))}
                            </>
                        )}

                        {/* Resumo do pagamento */}
                        {(() => {
                            const totalConta = fecharMesaMode && mesaSelecionada
                                ? mesaSelecionada.totalMesa
                                : (comandaAtiva?.total || 0);
                            const totalPago = pagamentos.reduce((a, p) => a + p.valor, 0);
                            const restante = totalConta - totalPago;
                            const quitado = Math.abs(restante) < 0.01;

                            return (
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: quitado ? "success.main" : "background.default",
                                        color: quitado ? "white" : "inherit",
                                        borderRadius: 2,
                                        transition: "all 0.3s",
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography fontSize={13} fontWeight={600} sx={{ opacity: quitado ? 0.9 : 0.6 }}>
                                            TOTAL PAGO
                                        </Typography>
                                        <Typography fontWeight={700}>
                                            {formatBRL(totalPago)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                        <Typography fontSize={13} fontWeight={600} sx={{ opacity: quitado ? 0.9 : 0.6 }}>
                                            {quitado ? "✅ CONTA QUITADA" : "RESTANTE"}
                                        </Typography>
                                        <Typography fontWeight={700} color={quitado ? "inherit" : "error.main"}>
                                            {quitado ? formatBRL(0) : formatBRL(restante)}
                                        </Typography>
                                    </Box>
                                </Paper>
                            );
                        })()}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenFechar(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleFecharComanda}
                            disabled={
                                actionLoading ||
                                pagamentos.length === 0 ||
                                Math.abs(
                                    pagamentos.reduce((a, p) => a + p.valor, 0) -
                                    (fecharMesaMode && mesaSelecionada
                                        ? mesaSelecionada.totalMesa
                                        : (comandaAtiva?.total || 0))
                                ) > 0.01
                            }
                            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
                        >
                            {actionLoading
                                ? "Fechando..."
                                : fecharMesaMode
                                    ? "Finalizar pagamento da mesa"
                                    : "Finalizar pagamento"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL DETALHES */}
                <Dialog open={openDetalhes} onClose={() => setOpenDetalhes(false)} fullWidth maxWidth="sm">
                    <Box sx={{ bgcolor: "primary.dark", color: "white", px: 3, py: 2 }}>
                        <Typography fontWeight={700} fontSize={18}>
                            Comanda — Mesa {comandaAtiva?.mesa}
                            {comandaAtiva?.cliente && ` — ${comandaAtiva.cliente}`}
                        </Typography>
                    </Box>
                    <DialogContent>
                        {comandaAtiva?.itens.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 2 }}>
                                Nenhum item lançado.
                            </Typography>
                        ) : (
                            comandaAtiva?.itens.map((item) => (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.5, mb: 1, display: "flex", alignItems: "center", gap: 1.5,
                                        opacity: item.cancelado ? 0.5 : 1,
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            fontWeight={600}
                                            fontSize={14}
                                            sx={{ textDecoration: item.cancelado ? "line-through" : "none" }}
                                        >
                                            {item.nome}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.quantidade}x {formatBRL(item.precoUnitario)}
                                        </Typography>
                                        {item.cancelado && item.motivoCancelamento && (
                                            <Typography variant="caption" color="error.main" display="block">
                                                Cancelado: {item.motivoCancelamento}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography
                                        fontWeight={700}
                                        fontSize={14}
                                        sx={{ textDecoration: item.cancelado ? "line-through" : "none" }}
                                    >
                                        {formatBRL(item.cancelado ? 0 : item.totalItem)}
                                    </Typography>
                                    {comandaAtiva.aberta && !item.cancelado && (
                                        <Tooltip title="Cancelar item">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleRemoverItem(item.id)}
                                            >
                                                <Cancel fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Paper>
                            ))
                        )}
                        <Paper sx={{ p: 2, mt: 2, bgcolor: "background.default", borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">TOTAL</Typography>
                            <Typography fontWeight={900} fontSize={20}>
                                {formatBRL(comandaAtiva?.total || 0)}
                            </Typography>
                        </Paper>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                        {comandaAtiva?.aberta && (comandaAtiva?.itens.filter(i => !i.cancelado).length ?? 0) > 0 && (
                            <>
                                <Tooltip title="Dividir comanda — mover itens para nova comanda">
                                    <Button
                                        size="small"
                                        startIcon={<CallSplit />}
                                        onClick={() => {
                                            setSplitItemIds([]);
                                            setSplitCliente("");
                                            setOpenDividir(true);
                                        }}
                                        sx={{ textTransform: "none" }}
                                    >
                                        Dividir
                                    </Button>
                                </Tooltip>
                                {mesaSelecionada && mesaSelecionada.comandas.length > 1 && (
                                    <Tooltip title="Transferir itens para outra comanda da mesa">
                                        <Button
                                            size="small"
                                            startIcon={<SwapHoriz />}
                                            onClick={() => {
                                                setTransferItemIds([]);
                                                setTransferDestinoId("");
                                                setOpenTransferir(true);
                                            }}
                                            sx={{ textTransform: "none" }}
                                        >
                                            Transferir
                                        </Button>
                                    </Tooltip>
                                )}
                            </>
                        )}
                        <Box sx={{ flex: 1 }} />
                        <Button onClick={() => setOpenDetalhes(false)} variant="outlined" sx={{ textTransform: "none" }}>
                            Fechar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL CANCELAR ITEM */}
                <Dialog open={openCancelar} onClose={() => setOpenCancelar(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ color: "error.main" }}>Cancelar Item</DialogTitle>
                    <DialogContent sx={{ pt: "16px !important" }}>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Informe o motivo do cancelamento. Esta ação não pode ser desfeita.
                        </Typography>
                        <TextField
                            label="Motivo do cancelamento"
                            value={cancelMotivo}
                            onChange={(e) => setCancelMotivo(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Ex: erro de lançamento, cliente desistiu, produto indisponível..."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCancelar(false)}>Voltar</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCancelarItem}
                            disabled={!cancelMotivo.trim() || actionLoading}
                            sx={{ textTransform: "none" }}
                        >
                            {actionLoading ? "Cancelando..." : "Confirmar Cancelamento"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL DIVIDIR COMANDA */}
                <Dialog open={openDividir} onClose={() => setOpenDividir(false)} fullWidth maxWidth="sm">
                    <Box sx={{ bgcolor: "primary.dark", color: "white", px: 3, py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CallSplit />
                            <Typography fontWeight={700} fontSize={18}>Dividir Comanda</Typography>
                        </Box>
                        <Typography fontSize={13} sx={{ opacity: 0.8 }}>
                            Selecione os itens para mover para uma nova comanda
                        </Typography>
                    </Box>
                    <DialogContent sx={{ pt: "16px !important" }}>
                        <TextField
                            label="Nome do cliente (nova comanda)"
                            value={splitCliente}
                            onChange={(e) => setSplitCliente(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        {comandaAtiva?.itens.filter(i => !i.cancelado).map((item) => (
                            <Paper
                                key={item.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5, mb: 0.5, display: "flex", alignItems: "center", gap: 1,
                                    cursor: "pointer",
                                    bgcolor: splitItemIds.includes(item.id) ? "primary.main" : "inherit",
                                    color: splitItemIds.includes(item.id) ? "white" : "inherit",
                                    "&:hover": { bgcolor: splitItemIds.includes(item.id) ? "primary.dark" : "action.hover" },
                                }}
                                onClick={() => {
                                    setSplitItemIds((prev) =>
                                        prev.includes(item.id)
                                            ? prev.filter((id) => id !== item.id)
                                            : [...prev, item.id]
                                    );
                                }}
                            >
                                <Checkbox
                                    checked={splitItemIds.includes(item.id)}
                                    size="small"
                                    sx={{
                                        p: 0.3,
                                        color: splitItemIds.includes(item.id) ? "white" : undefined,
                                        "&.Mui-checked": { color: "white" },
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize={14}>{item.nome}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {item.quantidade}x {formatBRL(item.precoUnitario)}
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} fontSize={14}>
                                    {formatBRL(item.totalItem)}
                                </Typography>
                            </Paper>
                        ))}
                        {splitItemIds.length > 0 && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "background.default", borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">TOTAL DA NOVA COMANDA</Typography>
                                <Typography fontWeight={700} fontSize={18}>
                                    {formatBRL(
                                        comandaAtiva?.itens
                                            .filter((i) => splitItemIds.includes(i.id))
                                            .reduce((a, i) => a + i.totalItem, 0) || 0
                                    )}
                                </Typography>
                            </Paper>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenDividir(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleDividirComanda}
                            disabled={splitItemIds.length === 0 || actionLoading}
                            startIcon={<CallSplit />}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            {actionLoading ? "Dividindo..." : `Dividir (${splitItemIds.length} itens)`}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL TRANSFERIR ITENS */}
                <Dialog open={openTransferir} onClose={() => setOpenTransferir(false)} fullWidth maxWidth="sm">
                    <Box sx={{ bgcolor: "primary.dark", color: "white", px: 3, py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <SwapHoriz />
                            <Typography fontWeight={700} fontSize={18}>Transferir Itens</Typography>
                        </Box>
                        <Typography fontSize={13} sx={{ opacity: 0.8 }}>
                            Selecione itens e a comanda destino
                        </Typography>
                    </Box>
                    <DialogContent sx={{ pt: "16px !important" }}>
                        <TextField
                            select
                            label="Comanda destino"
                            value={transferDestinoId}
                            onChange={(e) => setTransferDestinoId(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            {mesaSelecionada?.comandas
                                .filter((c) => c.id !== comandaAtiva?.id)
                                .map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.cliente || "Sem cliente"} — {formatBRL(c.total)}
                                    </MenuItem>
                                )) || []}
                        </TextField>
                        {comandaAtiva?.itens.filter(i => !i.cancelado).map((item) => (
                            <Paper
                                key={item.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5, mb: 0.5, display: "flex", alignItems: "center", gap: 1,
                                    cursor: "pointer",
                                    bgcolor: transferItemIds.includes(item.id) ? "primary.main" : "inherit",
                                    color: transferItemIds.includes(item.id) ? "white" : "inherit",
                                    "&:hover": { bgcolor: transferItemIds.includes(item.id) ? "primary.dark" : "action.hover" },
                                }}
                                onClick={() => {
                                    setTransferItemIds((prev) =>
                                        prev.includes(item.id)
                                            ? prev.filter((id) => id !== item.id)
                                            : [...prev, item.id]
                                    );
                                }}
                            >
                                <Checkbox
                                    checked={transferItemIds.includes(item.id)}
                                    size="small"
                                    sx={{
                                        p: 0.3,
                                        color: transferItemIds.includes(item.id) ? "white" : undefined,
                                        "&.Mui-checked": { color: "white" },
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize={14}>{item.nome}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {item.quantidade}x {formatBRL(item.precoUnitario)}
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} fontSize={14}>
                                    {formatBRL(item.totalItem)}
                                </Typography>
                            </Paper>
                        ))}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenTransferir(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleTransferirItens}
                            disabled={transferItemIds.length === 0 || !transferDestinoId || actionLoading}
                            startIcon={<SwapHoriz />}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            {actionLoading ? "Transferindo..." : `Transferir (${transferItemIds.length} itens)`}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL JUNTAR COMANDAS */}
                <Dialog open={openJuntar} onClose={() => setOpenJuntar(false)} fullWidth maxWidth="xs">
                    <Box sx={{ bgcolor: "primary.dark", color: "white", px: 3, py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MergeType />
                            <Typography fontWeight={700} fontSize={18}>Juntar Comandas</Typography>
                        </Box>
                        <Typography fontSize={13} sx={{ opacity: 0.8 }}>
                            Selecione as comandas para unificar (mínimo 2)
                        </Typography>
                    </Box>
                    <DialogContent sx={{ pt: "16px !important" }}>
                        {mesaSelecionada?.comandas.map((c) => (
                            <Paper
                                key={c.id}
                                variant="outlined"
                                sx={{
                                    p: 1.5, mb: 0.5, display: "flex", alignItems: "center", gap: 1,
                                    cursor: "pointer",
                                    bgcolor: mergeIds.includes(c.id) ? "primary.main" : "inherit",
                                    color: mergeIds.includes(c.id) ? "white" : "inherit",
                                    "&:hover": { bgcolor: mergeIds.includes(c.id) ? "primary.dark" : "action.hover" },
                                }}
                                onClick={() => {
                                    setMergeIds((prev) =>
                                        prev.includes(c.id)
                                            ? prev.filter((id) => id !== c.id)
                                            : [...prev, c.id]
                                    );
                                }}
                            >
                                <Checkbox
                                    checked={mergeIds.includes(c.id)}
                                    size="small"
                                    sx={{
                                        p: 0.3,
                                        color: mergeIds.includes(c.id) ? "white" : undefined,
                                        "&.Mui-checked": { color: "white" },
                                    }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600} fontSize={14}>
                                        {c.cliente || "Sem cliente"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {c.itens.filter(i => !i.cancelado).length} itens
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700} fontSize={14}>
                                    {formatBRL(c.total)}
                                </Typography>
                            </Paper>
                        ))}
                        {mergeIds.length >= 2 && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "background.default", borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">TOTAL UNIFICADO</Typography>
                                <Typography fontWeight={700} fontSize={18}>
                                    {formatBRL(
                                        mesaSelecionada?.comandas
                                            .filter((c) => mergeIds.includes(c.id))
                                            .reduce((a, c) => a + c.total, 0) || 0
                                    )}
                                </Typography>
                            </Paper>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenJuntar(false)}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleJuntarComandas}
                            disabled={mergeIds.length < 2 || actionLoading}
                            startIcon={<MergeType />}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            {actionLoading ? "Juntando..." : `Juntar (${mergeIds.length} comandas)`}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}
