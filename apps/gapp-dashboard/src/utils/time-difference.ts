/**
 * @description Returns number of seconds from provided date
 */
export const timeDifference = (date?: string) => {
    if (!date) return Infinity;

    return Date.now() / 1000 - Date.parse(date) / 1000;
};
