import {
    Box, Typography, Paper, TextField, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Chip, Alert, CircularProgress,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    InputAdornment, IconButton, Divider,
} from "@mui/material";
import {
    Search, Visibility, Receipt, AccessTime, CheckCircle, Delete,
    CalendarMonth, TableRestaurant,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { comandaService } from "../services/comandaService";
import { formatBRL, formatDateTime, formatTime } from "../utils/format";
import type { ComandaResponse } from "../types";

export default function Historico() {
    const [comandas, setComandas] = useState<ComandaResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtros
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroInicio, setFiltroInicio] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [filtroFim, setFiltroFim] = useState(dayjs().format("YYYY-MM-DD"));
    const [filtroMesa, setFiltroMesa] = useState("");

    // Detalhes
    const [openDetalhes, setOpenDetalhes] = useState(false);
    const [comandaSelecionada, setComandaSelecionada] = useState<ComandaResponse | null>(null);
    const [detalhesLoading, setDetalhesLoading] = useState(false);

    const fetchComandas = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await comandaService.listar({
                aberta: false,
                inicio: filtroInicio,
                fim: filtroFim,
                mesa: filtroMesa ? Number(filtroMesa) : undefined,
            });
            setComandas(data);
        } catch {
            setError("Erro ao carregar histórico de comandas");
        } finally {
            setLoading(false);
        }
    }, [filtroInicio, filtroFim, filtroMesa]);

    useEffect(() => {
        fetchComandas();
    }, [fetchComandas]);

    const handleVerDetalhes = async (c: ComandaResponse) => {
        try {
            setDetalhesLoading(true);
            const { data } = await comandaService.buscarPorId(c.id);
            setComandaSelecionada(data);
            setOpenDetalhes(true);
        } catch {
            setError("Erro ao carregar detalhes da comanda");
        } finally {
            setDetalhesLoading(false);
        }
    };

    // Filtro local por texto (cliente)
    const filtradas = comandas.filter(
        (c) =>
            (c.cliente || "").toLowerCase().includes(filtroTexto.toLowerCase()) ||
            String(c.mesa).includes(filtroTexto)
    );

    // Totais
    const totalFaturado = filtradas.reduce((a, c) => a + c.total, 0);
    const totalComandas = filtradas.length;


    const calcDuracao = (abertura: string, fechamento: string | null) => {
        if (!fechamento) return "—";
        const diff = new Date(fechamento).getTime() - new Date(abertura).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}min`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h${m > 0 ? ` ${m}min` : ""}`;
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>
                Histórico de Comandas
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* RESUMO */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ bgcolor: "success.main", borderRadius: 2, p: 1, display: "flex" }}>
                        <Receipt sx={{ color: "white" }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            COMANDAS NO PERÍODO
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="success.main">
                            {totalComandas}
                        </Typography>
                    </Box>
                </Paper>
                <Paper sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ bgcolor: "primary.main", borderRadius: 2, p: 1, display: "flex" }}>
                        <CheckCircle sx={{ color: "white" }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            TOTAL FATURADO
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                            {formatBRL(totalFaturado)}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* FILTROS */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar cliente ou mesa..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 180 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="De"
                        type="date"
                        value={filtroInicio}
                        onChange={(e) => setFiltroInicio(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 160 }}
                    />
                    <TextField
                        label="Até"
                        type="date"
                        value={filtroFim}
                        onChange={(e) => setFiltroFim(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 160 }}
                    />
                    <TextField
                        label="Mesa"
                        type="number"
                        value={filtroMesa}
                        onChange={(e) => setFiltroMesa(e.target.value)}
                        size="small"
                        sx={{ width: 90 }}
                        inputProps={{ min: 1 }}
                    />
                    <Button variant="outlined" size="small" onClick={fetchComandas} sx={{ textTransform: "none", fontWeight: 600 }}>
                        Buscar
                    </Button>
                </Box>
            </Paper>

            {/* TABELA */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "background.default" }}>
                                <TableCell><strong>Mesa</strong></TableCell>
                                <TableCell><strong>Cliente</strong></TableCell>
                                <TableCell><strong>Abertura</strong></TableCell>
                                <TableCell><strong>Fechamento</strong></TableCell>
                                <TableCell><strong>Duração</strong></TableCell>
                                <TableCell align="center"><strong>Itens</strong></TableCell>
                                <TableCell align="right"><strong>Total</strong></TableCell>
                                <TableCell align="center"><strong>Detalhes</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtradas.map((c) => (
                                <TableRow
                                    key={c.id}
                                    hover
                                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                                    onClick={() => handleVerDetalhes(c)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            <TableRestaurant sx={{ fontSize: 16, color: "primary.main" }} />
                                            <Typography fontWeight={600}>{c.mesa}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontSize={13} color={c.cliente ? "text.primary" : "text.secondary"}>
                                            {c.cliente || "Sem cliente"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontSize={13}>{formatDateTime(c.abertura)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontSize={13}>{formatDateTime(c.fechamento)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<AccessTime sx={{ fontSize: 14 }} />}
                                            label={calcDuracao(c.abertura, c.fechamento)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={c.itens.length}
                                            size="small"
                                            color="primary"
                                            sx={{ height: 22, fontSize: 12, fontWeight: 700, minWidth: 32 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight={700} fontSize={14} color="success.main">
                                            {formatBRL(c.total)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleVerDetalhes(c); }}>
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtradas.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <CalendarMonth sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                                        <Typography color="text.secondary">
                                            Nenhuma comanda fechada no período selecionado.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* MODAL DETALHES */}
            <Dialog open={openDetalhes} onClose={() => setOpenDetalhes(false)} fullWidth maxWidth="sm">
                {detalhesLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : comandaSelecionada && (
                    <>
                        {/* Header do modal */}
                        <Box sx={{ bgcolor: "primary.dark", color: "white", px: 3, py: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box>
                                    <Typography fontWeight={700} fontSize={18}>
                                        Mesa {comandaSelecionada.mesa}
                                    </Typography>
                                    <Typography fontSize={13} sx={{ opacity: 0.8 }}>
                                        {comandaSelecionada.cliente || "Sem cliente"}
                                    </Typography>
                                </Box>
                                <Chip
                                    label="Fechada"
                                    size="small"
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.15)",
                                        color: "white",
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Info de tempo */}
                        <Box sx={{ px: 3, py: 2, display: "flex", gap: 3, bgcolor: "background.default" }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>ABERTURA</Typography>
                                <Typography fontSize={13} fontWeight={600}>
                                    {formatDateTime(comandaSelecionada.abertura)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>FECHAMENTO</Typography>
                                <Typography fontSize={13} fontWeight={600}>
                                    {formatDateTime(comandaSelecionada.fechamento)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>DURAÇÃO</Typography>
                                <Typography fontSize={13} fontWeight={600}>
                                    {calcDuracao(comandaSelecionada.abertura, comandaSelecionada.fechamento)}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Itens com horário */}
                        <DialogContent sx={{ px: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                                ITENS CONSUMIDOS ({comandaSelecionada.itens.length})
                            </Typography>

                            {comandaSelecionada.itens.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                                    Nenhum item registrado.
                                </Typography>
                            ) : (
                                comandaSelecionada.itens.map((item, idx) => (
                                    <Paper
                                        key={item.id}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            mb: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        {/* Número do item */}
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: "50%",
                                                bgcolor: "primary.main",
                                                color: "white",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {idx + 1}
                                        </Box>

                                        {/* Info do produto */}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight={600} fontSize={14}>
                                                {item.nome}
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.quantidade}x {formatBRL(item.precoUnitario)}
                                                </Typography>
                                                <Chip
                                                    icon={<AccessTime sx={{ fontSize: 12 }} />}
                                                    label={formatTime(item.dataHora)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                                                />
                                            </Box>
                                        </Box>

                                        {/* Total do item */}
                                        <Typography fontWeight={700} fontSize={14}>
                                            {formatBRL(item.totalItem)}
                                        </Typography>
                                    </Paper>
                                ))
                            )}

                            {/* Total da comanda */}
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "background.default", borderRadius: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        TOTAL DA COMANDA
                                    </Typography>
                                    <Typography fontWeight={900} fontSize={22} color="success.main">
                                        {formatBRL(comandaSelecionada.total)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => setOpenDetalhes(false)} variant="outlined" sx={{ textTransform: "none" }}>
                                Fechar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
