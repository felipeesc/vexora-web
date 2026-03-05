import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import vexoraLogo from "../assets/vexora-logo.png";

export default function EsqueciSenha() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
    });

    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field === "email") {
            setEmailError(!/\S+@\S+\.\S+/.test(value));
        }
    };

    const handleSubmit = () => {
        alert("Funcionalidade em desenvolvimento. Entre em contato com o administrador.");
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
                overflowX: "hidden",
                px: { xs: 2, sm: 0 },
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {/* Logo */}
                <Box
                    component="img"
                    src={vexoraLogo}
                    alt="Vexora Code"
                    sx={{
                        width: { xs: 120, sm: 160 },
                        mb: { xs: 2, sm: 3 },
                    }}
                />

                <Paper
                    elevation={8}
                    sx={{
                        width: "100%",
                        p: { xs: 3, sm: 4 },
                        borderRadius: { xs: 2, sm: 3 },
                    }}
                >
                    <Typography variant="h6" mb={3} textAlign="center">
                        Esqueci minha senha
                    </Typography>

                    <TextField
                        fullWidth
                        label="Usuário"
                        value={form.username}
                        onChange={(e) => handleChange("username", e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        error={emailError}
                        helperText={emailError ? "Email inválido" : ""}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        onClick={handleSubmit}
                        sx={{ py: 1.3, borderRadius: 2, mb: 1 }}
                    >
                        {loading ? "Enviando..." : "Enviar"}
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={() => navigate("/login")}
                        sx={{ py: 1.3, borderRadius: 2 }}
                    >
                        Voltar para Login
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
}
