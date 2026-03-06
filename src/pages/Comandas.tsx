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
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { comandaService } from "../services/comandaService";
import { produtoService } from "../services/produtoService";
import { formatBRL } from "../utils/format";
import type { ComandaResponse, ProdutoResponse } from "../types";

interface CartItem {
    produtoId: string;
    nome: string;
    precoVenda: number;
    quantidade: number;
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
    const mesasOcupadas = comandas.length;

    const filtradas = comandas.filter(
        (c) =>
            (c.cliente || "").toLowerCase().includes(filtro.toLowerCase()) ||
            String(c.mesa).includes(filtro)
    );

    const produtoSelecionado = produtos.find((p) => p.id === novoProdutoId);
    const totalCarrinho = itensLancar.reduce((a, i) => a + i.precoVenda * i.quantidade, 0);

    /* ===================== HANDLERS ===================== */

    const handleAbrirComanda = async () => {
        if (!mesa) return;
        try {
            setActionLoading(true);
            await comandaService.abrir({ mesa: Number(mesa), cliente: cliente || undefined });
            setOpenNova(false);
            setMesa("");
            setCliente("");
            await fetchComandas();
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
            await fetchComandas();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao lançar itens");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoverItem = async (itemId: string) => {
        try {
            await comandaService.removerItem(itemId);
            if (comandaAtiva) {
                const { data } = await comandaService.buscarPorId(comandaAtiva.id);
                setComandaAtiva(data);
            }
            await fetchComandas();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao remover item");
        }
    };

    const handleFecharComanda = async () => {
        if (!comandaAtiva) return;
        try {
            setActionLoading(true);
            await comandaService.fechar(comandaAtiva.id);
            setOpenFechar(false);
            setComandaAtiva(null);
            await fetchComandas();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao fechar comanda");
        } finally {
            setActionLoading(false);
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

    /* ===================== UI ===================== */

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

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

            {/* CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" },
                    gap: 2.5,
                }}
            >
                {filtradas.map((c) => (
                    <Paper
                        key={c.id}
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
                        {/* Header */}
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
                                    Mesa {c.mesa}
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

                        {/* Body */}
                        <Box sx={{ p: 2 }}>
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

                            <Typography fontWeight={800} fontSize={24} color="error.main" sx={{ mb: 1.5 }}>
                                {formatBRL(c.total)}
                            </Typography>

                            {/* Ações */}
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
                                        onClick={() => {
                                            setComandaAtiva(c);
                                            setOpenFechar(true);
                                        }}
                                        sx={{ flex: 1, textTransform: "none", fontWeight: 600, fontSize: 12 }}
                                    >
                                        <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} />
                                        Fechar
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Paper>
                ))}

                {filtradas.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: "center", gridColumn: "1 / -1" }}>
                        <Typography color="text.secondary">
                            Nenhuma comanda aberta encontrada.
                        </Typography>
                    </Paper>
                )}
            </Box>

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
                <DialogTitle>Lançar Consumo — Mesa {comandaAtiva?.mesa}</DialogTitle>
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

            {/* MODAL FECHAR */}
            <Dialog open={openFechar} onClose={() => setOpenFechar(false)} fullWidth maxWidth="xs">
                <DialogTitle>Fechar Comanda</DialogTitle>
                <DialogContent>
                    <Typography>
                        Cliente: <strong>{comandaAtiva?.cliente || "Sem cliente"}</strong>
                    </Typography>
                    <Typography>
                        Mesa: <strong>{comandaAtiva?.mesa}</strong>
                    </Typography>
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">TOTAL A PAGAR</Typography>
                        <Typography fontSize={22} fontWeight={900} color="success.main">
                            {formatBRL(comandaAtiva?.total || 0)}
                        </Typography>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFechar(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleFecharComanda}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Fechando..." : "Confirmar & Fechar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DETALHES */}
            <Dialog open={openDetalhes} onClose={() => setOpenDetalhes(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Comanda — Mesa {comandaAtiva?.mesa}
                    {comandaAtiva?.cliente && ` — ${comandaAtiva.cliente}`}
                </DialogTitle>
                <DialogContent>
                    {comandaAtiva?.itens.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                            Nenhum item lançado.
                        </Typography>
                    ) : (
                        comandaAtiva?.itens.map((item) => (
                            <Paper key={item.id} sx={{ p: 2, mb: 1, display: "flex", alignItems: "center", gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600}>{item.nome}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.quantidade}x {formatBRL(item.precoUnitario)}
                                    </Typography>
                                </Box>
                                <Typography fontWeight={700}>{formatBRL(item.totalItem)}</Typography>
                                {comandaAtiva.aberta && (
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoverItem(item.id)}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            </Paper>
                        ))
                    )}
                    <Paper sx={{ p: 2, mt: 2, bgcolor: "background.default" }}>
                        <Typography variant="caption" color="text.secondary">TOTAL</Typography>
                        <Typography fontWeight={900} fontSize={20}>
                            {formatBRL(comandaAtiva?.total || 0)}
                        </Typography>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetalhes(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
