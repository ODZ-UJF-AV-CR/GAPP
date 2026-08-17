const escapeFluxString = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const arrayAsString = (array: (string | number)[]): string => {
    return `[${array.map((item) => `"${escapeFluxString(String(item))}"`).join(',')}]`;
};
