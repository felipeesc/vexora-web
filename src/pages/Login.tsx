import { Box, Button, TextField, Typography, Paper, Alert, Collapse } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import vexoraLogo from "../assets/vexora-logo.png";
import {authPageContainer} from "../theme/authStyles.ts";
import api from "../api/axios";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    // Setup Admin
    const [showSetup, setShowSetup] = useState(false);
    const [setupUsername, setSetupUsername] = useState("");
    const [setupMsg, setSetupMsg] = useState("");
    const [setupError, setSetupError] = useState("");
    const [setupLoading, setSetupLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Preencha usuário e senha");
            return;
        }
        try {
            setLoading(true);
            setError("");
            await login(username, password);
            navigate("/");
        } catch {
            setError("Usuário ou senha inválidos");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleLogin();
    };

    const handleSetupAdmin = async () => {
        if (!setupUsername) { setSetupError("Informe o username"); return; }
        try {
            setSetupLoading(true);
            setSetupError("");
            const { data } = await api.post("/auth/setup-admin", { username: setupUsername });
            setSetupMsg(data.message || "Usuário promovido para ADMIN! Faça login novamente.");
        } catch (err: any) {
            setSetupError(err?.response?.data?.message || "Erro ao promover usuário");
        } finally {
            setSetupLoading(false);
        }
    };

    return (
        <Box sx={authPageContainer}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 380,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Box
                    component="img"
                    src={vexoraLogo}
                    alt="Vexora Code"
                    sx={{ width: 160, mb: 1 }}
                />

                <Paper elevation={8} sx={{ width: "100%", p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" mb={3}>
                        Entrar
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{ mb: 1 }}
                    />

                    <Typography
                        fontSize={14}
                        sx={{
                            textAlign: "right",
                            color: "primary.main",
                            cursor: "pointer",
                            mb: 2,
                            "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => navigate("/esqueci-senha")}
                    >
                        Esqueci minha senha
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        onClick={handleLogin}
                        sx={{ py: 1.3, borderRadius: 2 }}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </Button>

                    <Typography mt={3} fontSize={14} textAlign="center">
                        Não tem uma conta?{" "}
                        <Box
                            component="span"
                            sx={{ color: "secondary.main", fontWeight: 600, cursor: "pointer" }}
                            onClick={() => navigate("/criar-conta")}
                        >
                            Criar conta
                        </Box>
                    </Typography>
                </Paper>

                {/* Painel Setup Admin — primeiro acesso */}
                <Box sx={{ width: "100%" }}>
                    <Typography
                        fontSize={12}
                        sx={{
                            textAlign: "center",
                            color: "text.disabled",
                            cursor: "pointer",
                            "&:hover": { color: "warning.main" },
                        }}
                        onClick={() => { setShowSetup(v => !v); setSetupMsg(""); setSetupError(""); }}
                    >
                        ⚙️ Primeiro acesso? Configurar Admin
                    </Typography>
                    <Collapse in={showSetup}>
                        <Paper sx={{ p: 2, mt: 1, border: "1px solid", borderColor: "warning.main", borderRadius: 2 }}>
                            <Typography fontSize={13} fontWeight={600} color="warning.main" mb={1}>
                                Setup Inicial — Promover para ADMIN
                            </Typography>
                            {setupMsg && <Alert severity="success" sx={{ mb: 1, fontSize: 12 }}>{setupMsg}</Alert>}
                            {setupError && <Alert severity="error" sx={{ mb: 1, fontSize: 12 }}>{setupError}</Alert>}
                            <TextField
                                fullWidth size="small" label="Seu username"
                                value={setupUsername}
                                onChange={e => setSetupUsername(e.target.value)}
                                sx={{ mb: 1 }}
                            />
                            <Button
                                fullWidth variant="outlined" color="warning" size="small"
                                disabled={setupLoading}
                                onClick={handleSetupAdmin}
                            >
                                {setupLoading ? "Aguarde..." : "Tornar ADMIN"}
                            </Button>
                            <Typography fontSize={11} color="text.secondary" mt={1}>
                                Só funciona se ainda não houver nenhum ADMIN no sistema.
                                Após promover, faça login novamente.
                            </Typography>
                        </Paper>
                    </Collapse>
                </Box>
            </Box>
        </Box>
    );
}
