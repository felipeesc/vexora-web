export const formatBRL = (value: number): string =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
