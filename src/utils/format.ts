export const formatBRL = (value: number): string =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDateTime = (iso: string | null): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

