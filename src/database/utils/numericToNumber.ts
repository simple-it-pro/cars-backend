export const numericToNumber = {
    to: (value: number | null | undefined) =>
        value === undefined ? null : value,
    from: (value: string | null) =>
        value === null ? null : Number.parseFloat(value),
};
