import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    AppBar,
    Toolbar,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    Menu as MenuIcon,
    Receipt as ReceiptIcon,
    Inventory as InventoryIcon,
    BarChart as BarChartIcon,
    Warehouse as WarehouseIcon,
    SwapVert as SwapVertIcon,
    Logout as LogoutIcon,
    History as HistoryIcon,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext";
import logoBranca from "../assets/vexora-logo.png";

const DRAWER_WIDTH = 250;

const menuItems = [
    { label: "Comandas", path: "/", icon: <ReceiptIcon /> },
    { label: "Histórico", path: "/historico", icon: <HistoryIcon /> },
    { label: "Produtos", path: "/produtos", icon: <InventoryIcon /> },
    { label: "Estoque", path: "/estoque", icon: <WarehouseIcon /> },
    { label: "Movimentações", path: "/movimentacoes", icon: <SwapVertIcon /> },
    { label: "Relatórios", path: "/relatorios", icon: <BarChartIcon /> },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const drawerContent = (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, #0a2e6e 100%)`,
                color: "white",
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    pt: 4,
                    pb: 3,
                    px: 3,
                    display: "flex",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
                onClick={() => navigate("/")}
            >
                <Box
                    component="img"
                    src={logoBranca}
                    alt="Vexora"
                    sx={{ width: 140 }}
                />
            </Box>

            {/* Separador sutil */}
            <Box sx={{ mx: 3, mb: 2, borderBottom: "1px solid rgba(255,255,255,0.12)" }} />

            {/* Navegação */}
            <List sx={{ flex: 1, px: 1.5 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.path}
                            selected={isActive}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 1.1,
                                color: "rgba(255,255,255,0.7)",
                                "&.Mui-selected": {
                                    bgcolor: "rgba(255,255,255,0.15)",
                                    color: "white",
                                    "& .MuiListItemIcon-root": { color: "white" },
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                },
                                "&:not(.Mui-selected):hover": {
                                    bgcolor: "rgba(255,255,255,0.08)",
                                    color: "white",
                                },
                                "& .MuiListItemIcon-root": {
                                    color: "rgba(255,255,255,0.5)",
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 700 : 400,
                                    fontSize: 14,
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Separador */}
            <Box sx={{ mx: 3, borderBottom: "1px solid rgba(255,255,255,0.12)" }} />

            {/* Logout */}
            <List sx={{ px: 1.5, py: 1.5 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        py: 1.1,
                        color: "rgba(255,255,255,0.6)",
                        "&:hover": {
                            bgcolor: "rgba(255,80,80,0.15)",
                            color: "#ff8a80",
                            "& .MuiListItemIcon-root": { color: "#ff8a80" },
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 38, color: "rgba(255,255,255,0.4)" }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sair"
                        primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                    />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* AppBar mobile */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        zIndex: theme.zIndex.drawer + 1,
                        bgcolor: theme.palette.primary.dark,
                    }}
                >
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                        <Box component="img" src={logoBranca} alt="Vexora" sx={{ height: 26 }} />
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={() => setMobileOpen(false)}
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box",
                        border: "none",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: { xs: 2, md: 4 },
                    mt: isMobile ? 8 : 0,
                    overflow: "auto",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
