import { useMediaQuery } from "@mantine/hooks";

export function useIsMobile(): boolean {
    return Boolean(useMediaQuery("(max-width: 768px)", false));
}