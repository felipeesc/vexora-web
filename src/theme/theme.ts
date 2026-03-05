import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
            dark: "#0d47a1",
        },
        secondary: {
            main: "#ff5722",
        },
        error: {
            main: "#d32f2f",
        },
        success: {
            main: "#2e7d32",
        },
        warning: {
            main: "#f57c00",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
});
