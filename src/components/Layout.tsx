import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    IconButton,
    AppBar,
    Avatar,
    Divider,
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
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/vexora-logo.png";

const DRAWER_WIDTH = 260;

const menuItems = [
    { label: "Comandas", path: "/", icon: <ReceiptIcon /> },
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
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Toolbar sx={{ justifyContent: "center", py: 2 }}>
                <Box component="img" src={logo} alt="Vexora" sx={{ width: 120 }} />
            </Toolbar>
            <Divider />
            <List sx={{ flex: 1, pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.path}
                        selected={location.pathname === item.path}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            mb: 0.5,
                            "&.Mui-selected": {
                                bgcolor: "primary.main",
                                color: "white",
                                "& .MuiListItemIcon-root": { color: "white" },
                                "&:hover": { bgcolor: "primary.dark" },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List>
                <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <LogoutIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Sair" sx={{ "& .MuiTypography-root": { color: "error.main" } }} />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* AppBar mobile */}
            {isMobile && (
                <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
                            Vexora
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "white", color: "primary.main", fontSize: 14 }}>
                            V
                        </Avatar>
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
