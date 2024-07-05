import { useDisclosure } from "@mantine/hooks";
import {
    ActionIcon,
    AppShell,
    Avatar,
    Burger,
    Button,
    Divider,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import {
    IconFeather,
    IconHome,
    IconLogicAnd,
    IconLogout,
    IconPuzzle,
    IconServerCog,
    IconUser,
    IconUserCog,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { AuthMixin, useApi, useScoped } from "../../util/api";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";

function NavItem({
    icon,
    title,
    path,
}: {
    icon: (props: any) => ReactNode;
    title: string;
    path: string;
}) {
    const IconElement = icon;
    const nav = useNavigate();
    const location = useLocation();
    return (
        <Button
            className="nav-item"
            variant={location.pathname === path ? "filled" : "light"}
            leftSection={<IconElement size={22} />}
            size="md"
            justify="left"
            onClick={() => nav(path)}
        >
            {title}
        </Button>
    );
}

export function Layout() {
    const [opened, { toggle }] = useDisclosure();
    const { t } = useTranslation();
    const { state, auth, methods: api } = useApi(AuthMixin);
    const nav = useNavigate();
    const adminScoped = useScoped([
        "admin.users.manage.*",
        "admin.groups.manage.*",
        "admin.plugins.manage.*",
    ]);
    const resourceScoped = useScoped(["resources.*"]);
    const pipelineScoped = useScoped(["pipelines.*"]);

    useEffect(() => {
        if (state === "ready" && !auth?.user) {
            nav("/auth/login");
        }
    }, [state, auth?.user?.id]);

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

            <AppShell.Navbar className="app-nav">
                <Stack gap={0} className="nav-main">
                    <Stack gap="sm" className="nav-links" p="sm">
                        <NavItem
                            icon={IconHome}
                            title={t("views.layout.nav.home")}
                            path="/"
                        />
                        {resourceScoped && (
                            <NavItem
                                icon={IconPuzzle}
                                title={t("views.layout.nav.resources")}
                                path="/resources"
                            />
                        )}
                        {pipelineScoped && (
                            <NavItem
                                icon={IconLogicAnd}
                                title={t("views.layout.nav.pipelines")}
                                path="/pipelines"
                            />
                        )}
                        {adminScoped && (
                            <NavItem
                                icon={IconServerCog}
                                title={t("views.layout.nav.admin")}
                                path="/admin"
                            />
                        )}
                    </Stack>
                    <Divider />
                    {auth?.user && (
                        <Group
                            gap="sm"
                            wrap="nowrap"
                            p="sm"
                            justify="space-between"
                        >
                            <Group gap="sm">
                                <Avatar size="md">
                                    <IconUser />
                                </Avatar>
                                <Text>{auth.user.username}</Text>
                            </Group>
                            <Group gap="sm">
                                <ActionIcon variant="light" size="lg">
                                    <IconUserCog size={20} />
                                </ActionIcon>
                                <Button
                                    rightSection={<IconLogout size={20} />}
                                    variant="light"
                                    onClick={() => api.logout()}
                                >
                                    {t("views.layout.logout")}
                                </Button>
                            </Group>
                        </Group>
                    )}
                </Stack>
            </AppShell.Navbar>

            <AppShell.Main className="app-main">
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
