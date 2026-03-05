import { Box, Button, TextField, Typography, Paper, MenuItem, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Role } from "../types";
import vexoraLogo from "../assets/vexora-logo.png";

export default function CriarConta() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        role: Role.ROLE_USER as Role,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.username || !form.password) {
            setError("Preencha usuário e senha");
            return;
        }
        if (form.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await authService.signup({
                username: form.username,
                password: form.password,
                role: form.role,
            });
            setSuccess("Conta criada com sucesso!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Erro ao criar conta";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={authPageContainer}>
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
                        Criar Conta
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Usuário"
                        value={form.username}
                        onChange={(e) => handleChange("username", e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        helperText="Mínimo 6 caracteres"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Confirmar Senha"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Perfil"
                        value={form.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value={Role.ROLE_USER}>Usuário</MenuItem>
                        <MenuItem value={Role.ROLE_ADMIN}>Administrador</MenuItem>
                    </TextField>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        onClick={handleSubmit}
                        sx={{ py: 1.3, borderRadius: 2, mb: 1 }}
                    >
                        {loading ? "Criando..." : "Criar Conta"}
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
