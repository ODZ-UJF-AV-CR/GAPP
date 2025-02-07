/**
 * @description Returns number of seconds from provided date
 */
export const timeDifference = (date: string) => {
    return Date.parse(date) / 1000 - Date.now() / 1000;
};
