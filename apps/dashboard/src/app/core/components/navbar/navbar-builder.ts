export interface NavbarData {
    icon: string;
    showInNavbar: true;
}

export const useNavbar = (icon: string): { navbar: NavbarData } => ({
    navbar: {
        icon,
        showInNavbar: true,
    },
});
