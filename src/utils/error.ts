import { AxiosError } from "axios";

interface ApiErrorData {
    message?: string;
    errors?: Record<string, string>;
}

/**
 * Extrai mensagem de erro de uma resposta Axios de forma tipada.
 * Elimina a necessidade de `catch (err: any)` nos componentes.
 */
export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado"): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorData | undefined;
        if (data?.message) return data.message;
        if (data?.errors) {
            return Object.values(data.errors).join(". ");
        }
    }
    if (error instanceof Error) return error.message;
    return fallback;
}
