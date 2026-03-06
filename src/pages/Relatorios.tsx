import {
    Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TextField,
} from "@mui/material";
import {
    AttachMoney, TrendingUp, EmojiEvents,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { relatorioService } from "../services/relatorioService";
import { formatBRL } from "../utils/format";
import type { FaturamentoDTO, ProdutoMaisVendidoDTO } from "../types";


export default function Relatorios() {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Faturamento
    const [fatDiario, setFatDiario] = useState<FaturamentoDTO | null>(null);
    const [fatSemanal, setFatSemanal] = useState<FaturamentoDTO | null>(null);
    const [fatMensal, setFatMensal] = useState<FaturamentoDTO | null>(null);
    const [dataDiario, setDataDiario] = useState(dayjs().format("YYYY-MM-DD"));

    // Mais vendidos
    const [vendidosDia, setVendidosDia] = useState<ProdutoMaisVendidoDTO[]>([]);
    const [vendidosSemana, setVendidosSemana] = useState<ProdutoMaisVendidoDTO[]>([]);
    const [vendidosMes, setVendidosMes] = useState<ProdutoMaisVendidoDTO[]>([]);

    const fetchFaturamento = useCallback(async () => {
        try {
            setLoading(true);
            const [diario, semanal, mensal] = await Promise.all([
                relatorioService.faturamentoDiario(dataDiario),
                relatorioService.faturamentoSemanal(dataDiario),
                relatorioService.faturamentoMensal(dataDiario),
            ]);
            setFatDiario(diario.data);
            setFatSemanal(semanal.data);
            setFatMensal(mensal.data);
        } catch {
            setError("Erro ao carregar faturamento");
        } finally {
            setLoading(false);
        }
    }, [dataDiario]);

    const fetchMaisVendidos = useCallback(async () => {
        try {
            setLoading(true);
            const [dia, semana, mes] = await Promise.all([
                relatorioService.produtosMaisVendidosDia(dataDiario),
                relatorioService.produtosMaisVendidosSemana(dataDiario),
                relatorioService.produtosMaisVendidosMes(dataDiario),
            ]);
            setVendidosDia(dia.data);
            setVendidosSemana(semana.data);
            setVendidosMes(mes.data);
        } catch {
            setError("Erro ao carregar produtos mais vendidos");
        } finally {
            setLoading(false);
        }
    }, [dataDiario]);

    useEffect(() => {
        if (tab === 0) fetchFaturamento();
        else fetchMaisVendidos();
    }, [tab, fetchFaturamento, fetchMaisVendidos]);

    const FaturamentoCard = ({ label, icon, data }: { label: string; icon: React.ReactNode; data: FaturamentoDTO | null }) => (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {icon}
                <Typography variant="subtitle1" fontWeight={700}>{label}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 4 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">BRUTO</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                        {data ? formatBRL(data.faturamentoBruto) : "—"}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">LÍQUIDO</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                        {data ? formatBRL(data.faturamentoLiquido) : "—"}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );

    const VendidosTable = ({ data, label }: { data: ProdutoMaisVendidoDTO[]; label: string }) => (
        <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>{label}</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>#</strong></TableCell>
                            <TableCell><strong>Produto</strong></TableCell>
                            <TableCell align="right"><strong>Qtd Vendida</strong></TableCell>
                            <TableCell align="right"><strong>Estoque Atual</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((p, i) => (
                            <TableRow key={p.produto}>
                                <TableCell>
                                    {i === 0 ? <EmojiEvents color="warning" sx={{ fontSize: 20 }} /> : i + 1}
                                </TableCell>
                                <TableCell>{p.produto}</TableCell>
                                <TableCell align="right">{p.quantidadeVendida}</TableCell>
                                <TableCell align="right">{p.estoqueAtual}</TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">Nenhum dado no período.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>Relatórios</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab label="Faturamento" />
                    <Tab label="Mais Vendidos" />
                </Tabs>
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : (
                <>
                    {tab === 0 && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    label="Data de referência"
                                    type="date"
                                    value={dataDiario}
                                    onChange={(e) => setDataDiario(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Diário: este dia · Semanal: semana deste dia · Mensal: mês deste dia"
                                />
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 3 }}>
                                <FaturamentoCard label="Diário" icon={<AttachMoney color="primary" />} data={fatDiario} />
                                <FaturamentoCard label="Semanal" icon={<TrendingUp color="primary" />} data={fatSemanal} />
                                <FaturamentoCard label="Mensal" icon={<AttachMoney color="success" />} data={fatMensal} />
                            </Box>
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 3 }}>
                            <VendidosTable data={vendidosDia} label="Hoje" />
                            <VendidosTable data={vendidosSemana} label="Semana" />
                            <VendidosTable data={vendidosMes} label="Mês" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
