import {
    Box,
    Typography,
    Paper,
    Button,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
    MenuItem,
} from "@mui/material";
import {
    Add,
    TableBar,
    CheckCircleOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import extraLogo from "../assets/vexora-logo.png";

/* ===================== TYPES ===================== */

interface Comanda {
    id: number;
    title: string;
    mesa: string;
    valor: number;
}

interface Produto {
    id: number;
    nome: string;
    preco: number;
}

/* ===================== UTILS ===================== */

const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ===================== DATA ===================== */

const produtos: Produto[] = [
    { id: 1, nome: "Cerveja Skol", preco: 8 },
    { id: 2, nome: "Cerveja Heineken", preco: 12 },
    { id: 3, nome: "Refrigerante", preco: 6 },
    { id: 4, nome: "Água", preco: 4 },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const PRIMARY_BLUE = "#0d47a1";

    const [tab, setTab] = useState(0);
    const [userInitials, setUserInitials] = useState("TE");
    const [filtro, setFiltro] = useState("");

    const [openModal, setOpenModal] = useState(false);
    const [openLancar, setOpenLancar] = useState(false);
    const [openFechar, setOpenFechar] = useState(false);

    const [tipoPagamento, setTipoPagamento] = useState("");

    const [editing, setEditing] = useState<Comanda | null>(null);
    const [comandaAtiva, setComandaAtiva] = useState<Comanda | null>(null);

    const [mesa, setMesa] = useState("");
    const [cliente, setCliente] = useState("");

    const [produtoId, setProdutoId] = useState<number | "">("");
    const [quantidade, setQuantidade] = useState<number>(1);

    // 🔍 filtro do modal lançar
    const [filtroProduto, setFiltroProduto] = useState("");

    const [comandas, setComandas] = useState<Comanda[]>([
        { id: 1, title: "Cliente A", mesa: "Mesa 10", valor: 230.5 },
        { id: 2, title: "Cliente B", mesa: "Mesa 09", valor: 120 },
        { id: 3, title: "Cliente C", mesa: "Mesa 15", valor: 45.9 },
        { id: 4, title: "Cliente D", mesa: "Mesa 02", valor: 890 },
        { id: 5, title: "Cliente E", mesa: "Mesa 12", valor: 320.75 },
        { id: 6, title: "Cliente F", mesa: "Mesa 08", valor: 78.4 },
    ]);

    const mesasDisponiveis = Array.from({ length: 15 }, (_, i) =>
        `Mesa ${String(i + 1).padStart(2, "0")}`
    );

    useEffect(() => {
        const user = localStorage.getItem("username");
        if (user) setUserInitials(user.substring(0, 2).toUpperCase());
    }, []);

    const produtoSelecionado = produtos.find(p => p.id === produtoId);

    // 🔍 produtos filtrados no modal
    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(filtroProduto.toLowerCase())
    );

    const totalAberto = comandas.reduce((a, c) => a + c.valor, 0);
    const totalFechado = 2450;
    const mesasOcupadas = comandas.length;

    const filtradas = comandas.filter(
        c =>
            c.title.toLowerCase().includes(filtro.toLowerCase()) ||
            c.mesa.toLowerCase().includes(filtro.toLowerCase())
    );

    const mesasOcupadasList = comandas.map(c => c.mesa);
    const mesasLivres = mesasDisponiveis.filter(m => !mesasOcupadasList.includes(m));
    const mesasSelect = editing
        ? [editing.mesa, ...mesasLivres.filter(m => m !== editing.mesa)]
        : mesasLivres;

    /* ===================== HANDLERS ===================== */

    const handleNovaComanda = () => {
        setEditing(null);
        setMesa("");
        setCliente("");
        setOpenModal(true);
    };

    const handleEditar = (c: Comanda) => {
        setEditing(c);
        setMesa(c.mesa);
        setCliente(c.title);
        setOpenModal(true);
    };

    const handleSalvar = () => {
        if (editing) {
            setComandas(prev =>
                prev.map(c =>
                    c.id === editing.id ? { ...c, mesa, title: cliente } : c
                )
            );
        } else {
            setComandas(prev => [
                ...prev,
                { id: Date.now(), mesa, title: cliente, valor: 0 },
            ]);
        }
        setOpenModal(false);
    };

    const handleAbrirLancar = (c: Comanda) => {
        setComandaAtiva(c);
        setProdutoId("");
        setQuantidade(1);
        setFiltroProduto("");
        setOpenLancar(true);
    };

    const handleConfirmarLancamento = () => {
        if (!produtoSelecionado || !comandaAtiva) return;

        const total = produtoSelecionado.preco * quantidade;

        setComandas(prev =>
            prev.map(c =>
                c.id === comandaAtiva.id
                    ? { ...c, valor: c.valor + total }
                    : c
            )
        );

        setOpenLancar(false);
    };

    const handleAbrirFechar = (c: Comanda) => {
        setComandaAtiva(c);
        setOpenFechar(true);
    };

    const handleFinalizar = () => {
        setComandas(prev => prev.filter(c => c.id !== comandaAtiva?.id));
        setOpenFechar(false);
    };

    /* ===================== UI ===================== */

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                overflowX: "hidden",
                background: "linear-gradient(180deg,#0d47a1,#1976d2)",
            }}
        >
            <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, md: 6 }, py: 4 }}>
                {/* HEADER */}
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
                    <Box component="img" src={extraLogo} sx={{ width: 140 }} />
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>

                        <Avatar sx={{ bgcolor: "white", color: PRIMARY_BLUE }}>
                            {userInitials}
                        </Avatar>
                    </Box>
                </Box>

                {/* TABS */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        mb: 4,
                        "& .MuiTab-root": { color: "white" },
                        "& .Mui-selected": { color: "white", fontWeight: 700 },
                        "& .MuiTabs-indicator": { backgroundColor: "white" },
                    }}
                >
                    <Tab label="Comandas" />
                    <Tab label="Distribuidora" />
                </Tabs>

                {tab === 0 && (
                    <>
                        {/* RESUMO */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" },
                                gap: 3,
                                mb: 4,
                            }}
                        >
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="caption">TOTAL EM ABERTO</Typography>
                                <Typography fontWeight={900} color="error.main">
                                    {formatBRL(totalAberto)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 3 }}>
                                <Typography variant="caption">TOTAL FECHADO</Typography>
                                <Typography fontWeight={900} color="success.main">
                                    {formatBRL(totalFechado)}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 3 }}>
                                <Typography variant="caption">MESAS OCUPADAS</Typography>
                                <Typography fontWeight={900} sx={{ color: "#f57c00" }}>
                                    {mesasOcupadas}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* FILTRO */}
                        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                            <TextField
                                placeholder="FILTRAR"
                                value={filtro}
                                onChange={e => setFiltro(e.target.value)}
                                sx={{
                                    flex: 1,
                                    minWidth: 220,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 999,
                                        color: "white",
                                        "& fieldset": {
                                            borderColor: "rgba(255,255,255,.6)",
                                        },
                                    },
                                    input: { color: "white" },
                                }}
                            />

                            <Button
                                startIcon={<Add />}
                                onClick={handleNovaComanda}
                                sx={{
                                    bgcolor: "white",
                                    color: PRIMARY_BLUE,
                                    borderRadius: 999,
                                    px: 3,
                                    fontWeight: 700,
                                }}
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
                            {filtradas.map(c => (
                                <Paper key={c.id} sx={{ p: 2.5, borderRadius: 3 }}>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <TableBar sx={{ color: PRIMARY_BLUE }} />
                                        <Box>
                                            <Typography fontWeight={700}>{c.title}</Typography>
                                            <Typography variant="caption">{c.mesa}</Typography>
                                        </Box>
                                    </Box>

                                    <Typography fontWeight={550} sx={{ color: '#d32f2f', mt: 1 }}>
                                        {formatBRL(c.valor)}
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ height: 36, px: 2, borderRadius: 1.5, fontWeight: 600 }}
                                            onClick={() => handleEditar(c)}
                                        >
                                            EDITAR
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            startIcon={<CheckCircleOutline />}
                                            sx={{ height: 36, px: 2.5, borderRadius: 1.5, fontWeight: 700 }}
                                            onClick={() => handleAbrirFechar(c)}
                                        >
                                            FECHAR
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                height: 36,
                                                px: 2.5,
                                                borderRadius: 1.5,
                                                fontWeight: 700,
                                                bgcolor: PRIMARY_BLUE,
                                                "&:hover": { bgcolor: "#08306b" },
                                            }}
                                            onClick={() => handleAbrirLancar(c)}
                                        >
                                            LANÇAR
                                        </Button>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </>
                )}
            </Box>

            {/* MODAL NOVA / EDITAR */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editing ? "Editar Comanda" : "Nova Comanda"}</DialogTitle>
                <DialogContent>
                    <TextField select label="Mesa" fullWidth value={mesa} onChange={e => setMesa(e.target.value)} sx={{ mb: 2 }}>
                        {mesasSelect.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                    <TextField label="Cliente" fullWidth value={cliente} onChange={e => setCliente(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSalvar}>Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL LANÇAR COM FILTRO */}
            <Dialog open={openLancar} onClose={() => setOpenLancar(false)} fullWidth maxWidth="sm">
                <DialogTitle>Lançar Consumo</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>


                    <TextField
                        select
                        label="Produto"
                        value={produtoId}
                        onChange={e => setProdutoId(Number(e.target.value))}
                    >
                        {produtosFiltrados.map(p => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.nome}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        type="number"
                        label="Quantidade"
                        inputProps={{ min: 1 }}
                        value={quantidade}
                        onChange={e => setQuantidade(Number(e.target.value))}
                    />

                    <TextField
                        disabled
                        label="Preço"
                        value={produtoSelecionado ? formatBRL(produtoSelecionado.preco) : ""}
                    />

                    <TextField
                        disabled
                        label="Total"
                        value={
                            produtoSelecionado
                                ? formatBRL(produtoSelecionado.preco * quantidade)
                                : ""
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLancar(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleConfirmarLancamento}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL FECHAR */}
            <Dialog open={openFechar} onClose={() => setOpenFechar(false)} fullWidth maxWidth="sm">
                <DialogTitle>Fechar Comanda</DialogTitle>

                <DialogContent>
                    <Typography>
                        Cliente: <strong>{comandaAtiva?.title}</strong>
                    </Typography>
                    <Typography>
                        Mesa: <strong>{comandaAtiva?.mesa}</strong>
                    </Typography>

                    {/* SELECT TIPO PAGAMENTO */}
                    <TextField
                        select
                        fullWidth
                        label="Tipo de Pagamento"
                        value={tipoPagamento}
                        onChange={(e) => setTipoPagamento(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="CREDITO">Crédito</MenuItem>
                        <MenuItem value="DEBITO">Débito</MenuItem>
                        <MenuItem value="PIX">Pix</MenuItem>
                        <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                    </TextField>

                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="caption">TOTAL A PAGAR</Typography>
                        <Typography fontSize={22} fontWeight={900} color="success.main">
                            {formatBRL(comandaAtiva?.valor || 0)}
                        </Typography>
                    </Paper>
                </DialogContent>

                <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
                    <Button variant="outlined">Imprimir</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleFinalizar}
                        disabled={!tipoPagamento}
                    >
                        Pago & Finalizar
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
