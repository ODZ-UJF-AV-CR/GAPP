export interface NavbarData {
    icon: string;
    showInNavbar: true;
}

export const useNavbar = (icon: string): NavbarData => ({
    icon,
    showInNavbar: true,
});
