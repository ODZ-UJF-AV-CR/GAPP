/**
 * @description Returns number of seconds from provided date
 */
export const timeDifference = (date: Date) => {
    return Date.now() / 1000 - date.getTime() / 1000;
};
