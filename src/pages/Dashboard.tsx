import { Box, Typography } from "@mui/material";
import extraLogo from "../assets/vexora-logo-azul.png";

export default function Dashboard() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0d47a1, #1976d2)",
            }}
        >
            <Box
                component="img"
                src={extraLogo}
                alt="Vexora Code"
                sx={{ width: 240, mb: 3 }}
            />

            <Typography variant="h4" color="white" fontWeight="bold">
                VEXORA CODE
            </Typography>
        </Box>
    );
}
