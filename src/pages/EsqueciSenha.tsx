import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authPageContainer } from "../theme/authStyles";
import vexoraLogo from "../assets/vexora-logo.png";

export default function EsqueciSenha() {
    const navigate = useNavigate();

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
                    <Typography variant="h6" mb={2} textAlign="center">
                        Esqueci minha senha
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                        Funcionalidade em desenvolvimento. Entre em contato com o
                        administrador para redefinir sua senha.
                    </Alert>

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
