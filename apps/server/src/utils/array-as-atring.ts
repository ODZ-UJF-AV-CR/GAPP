export const arrayAsString = (array: (string | number)[]): string => {
    return `["${array.join('","')}"]`;
};
