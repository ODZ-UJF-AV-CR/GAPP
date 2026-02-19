export interface HeaderData {
    showHeader: boolean;
    title: string;
}

export const useHeader = (title: string): HeaderData => ({
    showHeader: true,
    title,
});
