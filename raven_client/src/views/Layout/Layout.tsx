import { useDisclosure } from "@mantine/hooks";
import { AppShell, Burger, Group, Text } from "@mantine/core";
import { IconFeather } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding="md"
            className="app-root"
        >
            <AppShell.Header className="app-header">
                <Group gap="sm" h="100%" pl="sm">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <IconFeather size={32} />
                    <Text size="xl" fw={600}>
                        {t("common.appName")}
                    </Text>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar className="app-nav" p="md"></AppShell.Navbar>

            <AppShell.Main className="app-main"></AppShell.Main>
        </AppShell>
    );
}
