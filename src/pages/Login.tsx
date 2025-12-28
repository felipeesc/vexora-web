import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import vexoraLogo from "../assets/vexora-logo.png";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/auth/login",
                {
                    username,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            );

            const { token } = response.data;

            // salva token
            localStorage.setItem("token", token);

            console.log("Token recebido:", token);

            // aqui depois você redireciona pro dashboard
            // navigate("/");

        } catch (error) {
            console.error("Erro no login:", error);
            alert("Usuário ou senha inválidos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: "100vw",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(180deg, #0d47a1 0%, #1976d2 100%)",
            }}
        >
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

                    <TextField
                        fullWidth
                        label="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                    />

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
                            sx={{
                                color: "#ff5722",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Criar conta
                        </Box>
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
}
