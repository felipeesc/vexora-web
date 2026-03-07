import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Tooltip,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { useUser } from '../auth/UserContext';
import { userService } from '../services/userService';
import { UserResponse, CreateUserRequest, Role } from '../types';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<UserResponse | null>(null);
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        password: '',
        role: Role.FUNCIONARIO
    });

    const { hasRole, hasAnyRole, currentUser } = useUser();
    const isAdmin = hasRole(Role.ADMIN);
    const canManageUsers = hasAnyRole([Role.ADMIN, Role.GERENTE]);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsuarios(response.data);
        } catch (err: any) {
            console.error('Erro ao carregar usuários:', err);
            setError('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsuarios();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleOpenDialog = (usuario?: UserResponse) => {
        if (usuario) {
            setEditingUsuario(usuario);
            setFormData({
                username: usuario.username,
                password: '', // Não pré-preenchemos a senha
                role: usuario.role
            });
        } else {
            setEditingUsuario(null);
            setFormData({ username: '', password: '', role: Role.FUNCIONARIO });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUsuario(null);
        setFormData({ username: '', password: '', role: Role.FUNCIONARIO });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            if (editingUsuario) {
                await userService.updateUser(editingUsuario.id, formData);
                setSuccess('Usuário atualizado com sucesso!');
            } else {
                await userService.createUser(formData);
                setSuccess('Usuário criado com sucesso!');
            }
            handleCloseDialog();
            fetchUsuarios();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Erro ao salvar usuário:', err);
            setError(err.response?.data?.message || 'Erro ao salvar usuário');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
            try {
                await userService.deleteUser(id);
                setSuccess('Usuário deletado com sucesso!');
                fetchUsuarios();

                setTimeout(() => setSuccess(null), 3000);
            } catch (err: any) {
                console.error('Erro ao deletar usuário:', err);
                setError(err.response?.data?.message || 'Erro ao deletar usuário');
                setTimeout(() => setError(null), 5000);
            }
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case Role.ADMIN:
                return 'error';
            case Role.GERENTE:
                return 'warning';
            case Role.FUNCIONARIO:
                return 'info';
            default:
                return 'default';
        }
    };

    const getRoleOptions = () => {
        if (hasRole(Role.ADMIN)) {
            return [Role.ADMIN, Role.GERENTE, Role.FUNCIONARIO];
        } else if (hasRole(Role.GERENTE)) {
            return [Role.FUNCIONARIO];
        }
        return [];
    };

    if (!isAdmin) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Acesso negado. Apenas administradores podem acessar esta página.
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Carregando usuários...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Usuários
                </Typography>
                {canManageUsers && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Novo Usuário
                    </Button>
                )}
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                            {usuarios.map((usuario: UserResponse) => (
                            <TableRow key={usuario.id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                        {usuario.username}
                                        {currentUser?.id === usuario.id && (
                                            <Chip label="Você" size="small" sx={{ ml: 1 }} />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={usuario.role}
                                        color={getRoleColor(usuario.role)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={usuario.enabled ? 'Ativo' : 'Inativo'}
                                        color={usuario.enabled ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Editar">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(usuario)}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    {currentUser?.id !== usuario.id && (
                                        <Tooltip title="Deletar">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(usuario.id)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {usuarios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary">
                                        Nenhum usuário encontrado
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para criar/editar usuário */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Username"
                        fullWidth
                        variant="outlined"
                        value={formData.username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label={editingUsuario ? "Nova Senha (deixe vazio para manter)" : "Senha"}
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                                onChange={(e: React.ChangeEvent<{ value: unknown }>) => setFormData({ ...formData, role: e.target.value as Role })}
                            label="Role"
                        >
                            {getRoleOptions().map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.username.trim() || (!editingUsuario && !formData.password.trim())}
                    >
                        {editingUsuario ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
