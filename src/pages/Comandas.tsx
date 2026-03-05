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
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
    IconButton,
} from "@mui/material";
import {
    Add,
    TableBar,
    CheckCircleOutline,
    Delete,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { comandaService } from "../services/comandaService";
import { produtoService } from "../services/produtoService";
import type { ComandaResponse, ProdutoResponse } from "../types";

/* ===================== UTILS ===================== */

const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Comandas() {
    const PRIMARY_BLUE = "#0d47a1";

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
    const [produtoId, setProdutoId] = useState("");
    const [quantidade, setQuantidade] = useState<number>(1);
    const [actionLoading, setActionLoading] = useState(false);

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

    const produtoSelecionado = produtos.find((p) => p.id === produtoId);

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

    const handleAdicionarItem = async () => {
        if (!comandaAtiva || !produtoId || quantidade < 1) return;
        try {
            setActionLoading(true);
            await comandaService.adicionarItem({
                comandaId: comandaAtiva.id,
                produtoId,
                quantidade,
            });
            setOpenLancar(false);
            setProdutoId("");
            setQuantidade(1);
            await fetchComandas();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao lançar item");
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
                    gap: 3,
                    mb: 4,
                }}
            >
                <Paper sx={{ p: 3 }}>
                    <Typography variant="caption" color="text.secondary">TOTAL EM ABERTO</Typography>
                    <Typography variant="h5" fontWeight={900} color="error.main">
                        {formatBRL(totalAberto)}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="caption" color="text.secondary">MESAS OCUPADAS</Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ color: "#f57c00" }}>
                        {mesasOcupadas}
                    </Typography>
                </Paper>
            </Box>

            {/* FILTRO + NOVA COMANDA */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <TextField
                    placeholder="Filtrar por cliente ou mesa..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 220 }}
                />
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenNova(true)}
                >
                    Nova Comanda
                </Button>
            </Box>

            {/* CARDS */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
                    gap: 3,
                }}
            >
                {filtradas.map((c) => (
                    <Paper key={c.id} sx={{ p: 2.5, borderRadius: 3 }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <TableBar sx={{ color: PRIMARY_BLUE }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={700}>
                                    {c.cliente || "Sem cliente"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Mesa {c.mesa}
                                </Typography>
                            </Box>
                            <Chip
                                label={`${c.itens.length} itens`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        <Typography fontWeight={700} sx={{ color: "#d32f2f", mt: 1, fontSize: 18 }}>
                            {formatBRL(c.total)}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleVerDetalhes(c)}
                            >
                                Detalhes
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ bgcolor: PRIMARY_BLUE }}
                                onClick={() => {
                                    setComandaAtiva(c);
                                    setProdutoId("");
                                    setQuantidade(1);
                                    setOpenLancar(true);
                                }}
                            >
                                Lançar
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleOutline />}
                                onClick={() => {
                                    setComandaAtiva(c);
                                    setOpenFechar(true);
                                }}
                            >
                                Fechar
                            </Button>
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

            {/* MODAL LANÇAR */}
            <Dialog open={openLancar} onClose={() => setOpenLancar(false)} fullWidth maxWidth="xs">
                <DialogTitle>Lançar Consumo — Mesa {comandaAtiva?.mesa}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    <TextField
                        select
                        label="Produto"
                        value={produtoId}
                        onChange={(e) => setProdutoId(e.target.value)}
                        fullWidth
                    >
                        {produtos.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.nome} — {formatBRL(p.precoVenda)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        type="number"
                        label="Quantidade"
                        value={quantidade}
                        onChange={(e) => setQuantidade(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        fullWidth
                    />
                    {produtoSelecionado && (
                        <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                            <Typography variant="caption" color="text.secondary">TOTAL DO LANÇAMENTO</Typography>
                            <Typography fontWeight={700} fontSize={18}>
                                {formatBRL(produtoSelecionado.precoVenda * quantidade)}
                            </Typography>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLancar(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleAdicionarItem}
                        disabled={!produtoId || quantidade < 1 || actionLoading}
                    >
                        {actionLoading ? "Lançando..." : "Confirmar"}
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
                    <Paper sx={{ p: 2, mt: 2, bgcolor: "#f5f5f5" }}>
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
