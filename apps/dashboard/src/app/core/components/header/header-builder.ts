export interface HeaderData {
    showHeader: boolean;
    title?: string;
    back?: string;
}

export interface HeaderOptions {
    back?: string;
}

export const useHeader = (title?: string, options?: HeaderOptions): { header: HeaderData } => ({
    header: {
        showHeader: true,
        title,
        back: options?.back,
    },
});
