import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import vexoraLogo from "../assets/vexora-logo.png";

export default function Login() {
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
            {/* CONTAINER CENTRAL */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 380,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {/* LOGO */}
                <Box
                    component="img"
                    src={vexoraLogo}
                    alt="Vexora Code"
                    sx={{
                        width: 160,
                        mb: 3,
                    }}
                />

                {/* CARD */}
                <Paper
                    elevation={8}
                    sx={{
                        width: "100%",
                        p: 4,
                        borderRadius: 3,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6" mb={3}>
                        Entrar
                    </Typography>

                    <TextField
                        fullWidth
                        label="Email"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Senha"
                        type="password"
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.3,
                            borderRadius: 2,
                        }}
                    >
                        Entrar
                    </Button>

                    <Typography mt={3} fontSize={14}>
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

                <Typography
                    mt={4}
                    fontSize={12}
                    color="rgba(255,255,255,0.8)"
                >
                    Felipe Carvalho
                </Typography>
            </Box>
        </Box>
    );
}
