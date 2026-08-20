export interface HeaderData {
    showHeader: boolean;
    title?: string | null;
    back?: string;
}

export interface HeaderOptions {
    back?: string;
}

export const useHeader = (title?: string | null, options?: HeaderOptions): { header: HeaderData } => ({
    header: {
        showHeader: true,
        title,
        back: options?.back,
    },
});
