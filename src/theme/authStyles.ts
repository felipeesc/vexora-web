import type { SxProps, Theme } from "@mui/material";

export const authPageContainer: SxProps<Theme> = (theme: Theme) => ({
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    overflowX: "hidden",
    px: { xs: 2, sm: 0 },
});
