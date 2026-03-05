import {
    Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, IconButton, Alert, Table, TableHead,
    TableBody, TableRow, TableCell, TableContainer, Chip, CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { produtoService } from "../services/produtoService";
import { CategoriaProduto, UnidadeMedida } from "../types";
import type { ProdutoResponse, ProdutoRequest } from "../types";

const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyForm: ProdutoRequest = {
    nome: "",
    categoria: CategoriaProduto.OUTROS,
    unidade: UnidadeMedida.UNIDADE,
    precoCompra: 0,
    precoVenda: 0,
    estoqueAtual: 0,
    estoqueMinimo: 0,
};

export default function Produtos() {
    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filtro, setFiltro] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProdutoRequest>(emptyForm);
    const [saving, setSaving] = useState(false);

    const [openDelete, setOpenDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ProdutoResponse | null>(null);

    const fetchProdutos = useCallback(async () => {
        try {
            const { data } = await produtoService.listar();
            setProdutos(data);
        } catch {
            setError("Erro ao carregar produtos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

    const handleField = (field: keyof ProdutoRequest, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleOpenNew = () => {
        setEditingId(null);
        setForm(emptyForm);
        setOpenForm(true);
    };

    const handleOpenEdit = (p: ProdutoResponse) => {
        setEditingId(p.id);
        setForm({
            nome: p.nome,
            categoria: p.categoria,
            unidade: p.unidade,
            precoCompra: p.precoCompra,
            precoVenda: p.precoVenda,
            estoqueAtual: p.estoqueAtual,
            estoqueMinimo: p.estoqueMinimo,
        });
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            if (editingId) {
                await produtoService.atualizar(editingId, form);
                setSuccess("Produto atualizado com sucesso!");
            } else {
                await produtoService.criar(form);
                setSuccess("Produto criado com sucesso!");
            }
            setOpenForm(false);
            await fetchProdutos();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao salvar produto");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await produtoService.deletar(deleteTarget.id);
            setSuccess("Produto removido!");
            setOpenDelete(false);
            setDeleteTarget(null);
            await fetchProdutos();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao remover produto");
        }
    };

    const filtrados = produtos.filter(
        (p) =>
            p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
            p.categoria.toLowerCase().includes(filtro.toLowerCase())
    );

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>Produtos</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                    placeholder="Filtrar por nome ou categoria..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: 220 }}
                />
                <Button variant="contained" startIcon={<Add />} onClick={handleOpenNew}>
                    Novo Produto
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Categoria</strong></TableCell>
                            <TableCell><strong>Unidade</strong></TableCell>
                            <TableCell align="right"><strong>Compra</strong></TableCell>
                            <TableCell align="right"><strong>Venda</strong></TableCell>
                            <TableCell align="right"><strong>Estoque</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtrados.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.nome}</TableCell>
                                <TableCell>
                                    <Chip label={p.categoria} size="small" />
                                </TableCell>
                                <TableCell>{p.unidade}</TableCell>
                                <TableCell align="right">{formatBRL(p.precoCompra)}</TableCell>
                                <TableCell align="right">{formatBRL(p.precoVenda)}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={p.estoqueAtual}
                                        size="small"
                                        color={p.estoqueAtual < p.estoqueMinimo ? "error" : "success"}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => { setDeleteTarget(p); setOpenDelete(true); }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtrados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Nenhum produto encontrado.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* FORM DIALOG */}
            <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    <TextField label="Nome" value={form.nome} onChange={(e) => handleField("nome", e.target.value)} fullWidth />
                    <TextField select label="Categoria" value={form.categoria} onChange={(e) => handleField("categoria", e.target.value)} fullWidth>
                        {Object.values(CategoriaProduto).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField select label="Unidade" value={form.unidade} onChange={(e) => handleField("unidade", e.target.value)} fullWidth>
                        {Object.values(UnidadeMedida).map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Preço Compra" type="number" value={form.precoCompra} onChange={(e) => handleField("precoCompra", Number(e.target.value))} fullWidth inputProps={{ min: 0, step: 0.01 }} />
                        <TextField label="Preço Venda" type="number" value={form.precoVenda} onChange={(e) => handleField("precoVenda", Number(e.target.value))} fullWidth inputProps={{ min: 0, step: 0.01 }} />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label="Estoque Atual" type="number" value={form.estoqueAtual} onChange={(e) => handleField("estoqueAtual", Number(e.target.value))} fullWidth inputProps={{ min: 0 }} />
                        <TextField label="Estoque Mínimo" type="number" value={form.estoqueMinimo} onChange={(e) => handleField("estoqueMinimo", Number(e.target.value))} fullWidth inputProps={{ min: 0 }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!form.nome || saving}>
                        {saving ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE DIALOG */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <Typography>Deseja realmente excluir <strong>{deleteTarget?.nome}</strong>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
