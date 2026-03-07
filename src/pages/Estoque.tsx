import {
    Box, Typography, Paper, Alert, CircularProgress, Table, TableHead,
    TableBody, TableRow, TableCell, TableContainer, Chip,
} from "@mui/material";
import { Warning, CheckCircle, Inventory } from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { relatorioService } from "../services/relatorioService";
import type { RelatorioEstoqueDTO } from "../types";

export default function Estoque() {
    const [relatorio, setRelatorio] = useState<RelatorioEstoqueDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEstoque = useCallback(async () => {
        try {
            const { data } = await relatorioService.relatorioEstoque();
            setRelatorio(data);
        } catch {
            setError("Erro ao carregar relatório de estoque");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEstoque(); }, [fetchEstoque]);

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>Estoque</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            {/* RESUMO */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 3, mb: 4 }}>
                <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Inventory color="primary" fontSize="large" />
                    <Box>
                        <Typography variant="caption" color="text.secondary">TOTAL DE PRODUTOS</Typography>
                        <Typography variant="h5" fontWeight={900}>{relatorio?.totalProdutos ?? 0}</Typography>
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <Warning color="error" fontSize="large" />
                    <Box>
                        <Typography variant="caption" color="text.secondary">ABAIXO DO MÍNIMO</Typography>
                        <Typography variant="h5" fontWeight={900} color="error.main">
                            {relatorio?.produtosAbaixoDoMinimo ?? 0}
                        </Typography>
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                    <CheckCircle color="success" fontSize="large" />
                    <Box>
                        <Typography variant="caption" color="text.secondary">ESTOQUE OK</Typography>
                        <Typography variant="h5" fontWeight={900} color="success.main">
                            {(relatorio?.totalProdutos ?? 0) - (relatorio?.produtosAbaixoDoMinimo ?? 0)}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* TABELA */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Produto</strong></TableCell>
                            <TableCell><strong>Categoria</strong></TableCell>
                            <TableCell><strong>Unidade</strong></TableCell>
                            <TableCell align="right"><strong>Estoque Atual</strong></TableCell>
                            <TableCell align="right"><strong>Estoque Mínimo</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {relatorio?.produtos.map((p) => (
                            <TableRow
                                key={p.id}
                                sx={p.abaixoDoMinimo ? { bgcolor: (t) => `${t.palette.error.main}10` } : {}}
                            >
                                <TableCell>{p.nome}</TableCell>
                                <TableCell><Chip label={p.categoria?.nome ?? "—"} size="small" /></TableCell>
                                <TableCell>{p.unidade}</TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight={600} color={p.abaixoDoMinimo ? "error.main" : "inherit"}>
                                        {p.estoqueAtual}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">{p.estoqueMinimo}</TableCell>
                                <TableCell align="center">
                                    {p.abaixoDoMinimo ? (
                                        <Chip label="Abaixo do mínimo" color="error" size="small" icon={<Warning />} />
                                    ) : (
                                        <Chip label="OK" color="success" size="small" icon={<CheckCircle />} />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!relatorio?.produtos || relatorio.produtos.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Nenhum produto cadastrado.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
