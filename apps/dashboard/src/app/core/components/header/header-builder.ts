export interface HeaderData {
    showHeader: boolean;
    title: string;
}

export const useHeader = (title: string): { header: HeaderData } => ({
    header: {
        showHeader: true,
        title,
    },
});
