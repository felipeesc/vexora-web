import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import vexoraLogo from "../assets/vexora-logo.png";
import {authPageContainer} from "../theme/authStyles.ts";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

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


    return (
        <Box sx={authPageContainer}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 380,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Box
                    component="img"
                    src={vexoraLogo}
                    alt="Vexora Code"
                    sx={{ width: 160, mb: 3 }}
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

                    {/* Esqueci minha senha */}
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
            </Box>
        </Box>
    );
}
