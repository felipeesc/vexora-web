import {
    Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Alert, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, Chip, CircularProgress,
} from "@mui/material";
import { Add, TrendingUp, TrendingDown } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { movimentacaoService } from "../services/movimentacaoService";
import { relatorioService } from "../services/relatorioService";
import { produtoService } from "../services/produtoService";
import { TipoMovimentacao, Role } from "../types";
import type { MovimentacaoResponse, ProdutoResponse, MovimentacaoRequest } from "../types";
import { formatDateTime } from "../utils/format";
import { useUser } from "../auth/UserContext";

export default function Movimentacoes() {
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoResponse[]>([]);
    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [inicio, setInicio] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [fim, setFim] = useState(dayjs().format("YYYY-MM-DD"));

    const [openForm, setOpenForm] = useState(false);
    const [form, setForm] = useState<MovimentacaoRequest>({
        produtoId: "",
        tipo: TipoMovimentacao.ENTRADA,
        quantidade: 0,
        motivo: "",
    });
    const [saving, setSaving] = useState(false);

    const { hasAnyRole } = useUser();
    const canCreateMovimentacao = hasAnyRole([Role.ADMIN, Role.GERENTE]);

    const fetchMovimentacoes = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await relatorioService.historicoMovimentacoes(inicio, fim);
            setMovimentacoes(data);
        } catch {
            setError("Erro ao carregar movimentações");
        } finally {
            setLoading(false);
        }
    }, [inicio, fim]);

    const fetchProdutos = useCallback(async () => {
        try {
            const { data } = await produtoService.listar();
            setProdutos(data);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchMovimentacoes(); fetchProdutos(); }, [fetchMovimentacoes, fetchProdutos]);

    const handleRegistrar = async () => {
        if (!form.produtoId || form.quantidade <= 0) return;
        try {
            setSaving(true);
            setError("");
            await movimentacaoService.registrar(form);
            setSuccess("Movimentação registrada com sucesso!");
            setOpenForm(false);
            setForm({ produtoId: "", tipo: TipoMovimentacao.ENTRADA, quantidade: 0, motivo: "" });
            await fetchMovimentacoes();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao registrar movimentação");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>Movimentações</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

            {/* FILTROS + AÇÃO */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                    label="De"
                    type="date"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Até"
                    type="date"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" onClick={fetchMovimentacoes}>Buscar</Button>
                <Box sx={{ flex: 1 }} />
                {canCreateMovimentacao && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpenForm(true)}>
                        Nova Movimentação
                    </Button>
                )}
            </Box>

            {/* TABELA */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Data/Hora</strong></TableCell>
                                <TableCell><strong>Produto</strong></TableCell>
                                <TableCell align="center"><strong>Tipo</strong></TableCell>
                                <TableCell align="right"><strong>Quantidade</strong></TableCell>
                                <TableCell><strong>Motivo</strong></TableCell>
                                <TableCell><strong>Usuário</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {movimentacoes.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{formatDateTime(m.dataHora)}</TableCell>
                                    <TableCell>{m.produtoNome}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={m.tipo}
                                            size="small"
                                            color={m.tipo === TipoMovimentacao.ENTRADA ? "success" : "error"}
                                            icon={m.tipo === TipoMovimentacao.ENTRADA ? <TrendingUp /> : <TrendingDown />}
                                        />
                                    </TableCell>
                                    <TableCell align="right">{m.quantidade}</TableCell>
                                    <TableCell>{m.motivo || "—"}</TableCell>
                                    <TableCell>{m.usuario || "—"}</TableCell>
                                </TableRow>
                            ))}
                            {movimentacoes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">Nenhuma movimentação no período.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* FORM DIALOG */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="xs">
                <DialogTitle>Registrar Movimentação</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    <TextField
                        select label="Produto" value={form.produtoId} fullWidth
                        onChange={(e) => setForm((p) => ({ ...p, produtoId: e.target.value }))}
                    >
                        {produtos.map((p) => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                    </TextField>
                    <TextField
                        select label="Tipo" value={form.tipo} fullWidth
                        onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as TipoMovimentacao }))}
                    >
                        <MenuItem value={TipoMovimentacao.ENTRADA}>Entrada</MenuItem>
                        <MenuItem value={TipoMovimentacao.SAIDA}>Saída</MenuItem>
                    </TextField>
                    <TextField
                        label="Quantidade" type="number" value={form.quantidade} fullWidth
                        onChange={(e) => setForm((p) => ({ ...p, quantidade: Number(e.target.value) }))}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        label="Motivo (opcional)" value={form.motivo} fullWidth
                        onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleRegistrar} disabled={!form.produtoId || form.quantidade <= 0 || saving}>
                        {saving ? "Registrando..." : "Registrar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
