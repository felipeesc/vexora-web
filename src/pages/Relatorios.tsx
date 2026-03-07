import {
    Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TextField,
    Chip, Button,
} from "@mui/material";
import {
    AttachMoney, TrendingUp, EmojiEvents, Inventory, History,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { relatorioService } from "../services/relatorioService";
import { formatBRL } from "../utils/format";
import { Role } from "../types";
import type { FaturamentoDTO, ProdutoMaisVendidoDTO, RelatorioEstoqueDTO, MovimentacaoResponse } from "../types";
import { useUser } from "../auth/UserContext";

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

    // Estoque
    const [estoque, setEstoque] = useState<RelatorioEstoqueDTO | null>(null);

    // Histórico de movimentações
    const [historico, setHistorico] = useState<MovimentacaoResponse[]>([]);
    const [historicoInicio, setHistoricoInicio] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [historicoFim, setHistoricoFim] = useState(dayjs().format("YYYY-MM-DD"));

    const { hasAnyRole } = useUser();
    const canViewReports = hasAnyRole([Role.ADMIN, Role.GERENTE]);

    if (!canViewReports) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight={700} mb={3}>Relatórios</Typography>
                <Alert severity="warning">
                    Você não tem permissão para visualizar relatórios.
                </Alert>
            </Box>
        );
    }

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

    const fetchEstoque = useCallback(async () => {
        try {
            setLoading(true);
            const res = await relatorioService.relatorioEstoque();
            setEstoque(res.data);
        } catch {
            setError("Erro ao carregar relatório de estoque");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistorico = useCallback(async () => {
        try {
            setLoading(true);
            const res = await relatorioService.historicoMovimentacoes(historicoInicio, historicoFim);
            setHistorico(res.data);
        } catch {
            setError("Erro ao carregar histórico de movimentações");
        } finally {
            setLoading(false);
        }
    }, [historicoInicio, historicoFim]);

    useEffect(() => {
        if (tab === 0) fetchFaturamento();
        else if (tab === 1) fetchMaisVendidos();
        else if (tab === 2) fetchEstoque();
        else if (tab === 3) fetchHistorico();
    }, [tab, fetchFaturamento, fetchMaisVendidos, fetchEstoque, fetchHistorico]);

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
                    <Tab label="Estoque" icon={<Inventory fontSize="small" />} iconPosition="start" />
                    <Tab label="Histórico" icon={<History fontSize="small" />} iconPosition="start" />
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

                    {tab === 2 && (
                        <Box>
                            {estoque && (
                                <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
                                    <Paper sx={{ p: 2, minWidth: 160 }}>
                                        <Typography variant="caption" color="text.secondary">TOTAL DE PRODUTOS</Typography>
                                        <Typography variant="h5" fontWeight={700}>{estoque.totalProdutos}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, minWidth: 160 }}>
                                        <Typography variant="caption" color="text.secondary">ABAIXO DO MÍNIMO</Typography>
                                        <Typography variant="h5" fontWeight={700} color={estoque.produtosAbaixoDoMinimo > 0 ? "error.main" : "text.primary"}>
                                            {estoque.produtosAbaixoDoMinimo}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                            <Paper sx={{ p: 2 }}>
                                <TableContainer>
                                    <Table size="small">
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
                                            {estoque?.produtos.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.nome}</TableCell>
                                                    <TableCell>{p.categoria?.nome ?? "—"}</TableCell>
                                                    <TableCell>{p.unidade}</TableCell>
                                                    <TableCell align="right">{p.estoqueAtual}</TableCell>
                                                    <TableCell align="right">{p.estoqueMinimo}</TableCell>
                                                    <TableCell align="center">
                                                        {p.abaixoDoMinimo
                                                            ? <Chip label="Baixo" color="error" size="small" />
                                                            : <Chip label="OK" color="success" size="small" />}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {!estoque?.produtos.length && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">Nenhum produto encontrado.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}

                    {tab === 3 && (
                        <Box>
                            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                                <TextField
                                    label="Início"
                                    type="date"
                                    value={historicoInicio}
                                    onChange={(e) => setHistoricoInicio(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Fim"
                                    type="date"
                                    value={historicoFim}
                                    onChange={(e) => setHistoricoFim(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button variant="contained" onClick={fetchHistorico} size="small">
                                    Filtrar
                                </Button>
                            </Box>
                            <Paper sx={{ p: 2 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Produto</strong></TableCell>
                                                <TableCell><strong>Tipo</strong></TableCell>
                                                <TableCell align="right"><strong>Quantidade</strong></TableCell>
                                                <TableCell><strong>Motivo</strong></TableCell>
                                                <TableCell><strong>Usuário</strong></TableCell>
                                                <TableCell><strong>Data/Hora</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historico.map((m) => (
                                                <TableRow key={m.id}>
                                                    <TableCell>{m.produtoNome}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={m.tipo}
                                                            color={m.tipo === "ENTRADA" ? "success" : "error"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{m.quantidade}</TableCell>
                                                    <TableCell>{m.motivo ?? "—"}</TableCell>
                                                    <TableCell>{m.usuario ?? "—"}</TableCell>
                                                    <TableCell>{dayjs(m.dataHora).format("DD/MM/YYYY HH:mm")}</TableCell>
                                                </TableRow>
                                            ))}
                                            {historico.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                        <Typography color="text.secondary">Nenhuma movimentação no período.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
