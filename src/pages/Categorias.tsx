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
    Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useUser } from '../auth/UserContext';
import { categoriaService } from '../services/categoriaService';
import { CategoriaResponse, CategoriaRequest, Role } from '../types';

export default function Categorias() {
    const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<CategoriaResponse | null>(null);
    const [formData, setFormData] = useState<CategoriaRequest>({
        nome: '',
        descricao: ''
    });

    const { hasAnyRole } = useUser();
    const canManage = hasAnyRole([Role.ADMIN, Role.GERENTE]);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const response = canManage
                ? await categoriaService.listarTodas()
                : await categoriaService.listar();
            setCategorias(response.data);
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
            setError('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, [canManage]);

    const handleOpenDialog = (categoria?: CategoriaResponse) => {
        if (categoria) {
            setEditingCategoria(categoria);
            setFormData({
                nome: categoria.nome,
                descricao: categoria.descricao || ''
            });
        } else {
            setEditingCategoria(null);
            setFormData({ nome: '', descricao: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCategoria(null);
        setFormData({ nome: '', descricao: '' });
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            if (editingCategoria) {
                await categoriaService.atualizar(editingCategoria.id, formData);
                setSuccess('Categoria atualizada com sucesso!');
            } else {
                await categoriaService.criar(formData);
                setSuccess('Categoria criada com sucesso!');
            }
            handleCloseDialog();
            fetchCategorias();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Erro ao salvar categoria:', err);
            setError(err.response?.data?.message || 'Erro ao salvar categoria');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
            try {
                await categoriaService.deletar(id);
                setSuccess('Categoria deletada com sucesso!');
                fetchCategorias();

                setTimeout(() => setSuccess(null), 3000);
            } catch (err: any) {
                console.error('Erro ao deletar categoria:', err);
                setError(err.response?.data?.message || 'Erro ao deletar categoria');
                setTimeout(() => setError(null), 5000);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Carregando categorias...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Categorias
                </Typography>
                {canManage && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nova Categoria
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
                            <TableCell>Nome</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Criado em</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                            {categorias.map((categoria: CategoriaResponse) => (
                            <TableRow key={categoria.id}>
                                <TableCell>{categoria.nome}</TableCell>
                                <TableCell>{categoria.descricao || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={categoria.ativa ? 'Ativa' : 'Inativa'}
                                        color={categoria.ativa ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(categoria.criadoEm).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell align="center">
                                    {canManage ? (
                                        <Box>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(categoria)}
                                                    color="primary"
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            {hasAnyRole([Role.ADMIN]) && (
                                                <Tooltip title="Deletar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(categoria.id)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    ) : (
                                        <Tooltip title="Visualizar">
                                            <IconButton size="small" disabled>
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {categorias.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary">
                                        Nenhuma categoria encontrada
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para criar/editar categoria */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
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
                        label="Nome da Categoria"
                        fullWidth
                        variant="outlined"
                        value={formData.nome}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Descrição (opcional)"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={formData.descricao}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.nome.trim()}
                    >
                        {editingCategoria ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
