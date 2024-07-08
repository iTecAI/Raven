import {
    ActionIcon,
    Badge,
    Divider,
    Fieldset,
    Group,
    Modal,
    Paper,
    ScrollAreaAutosize,
    Space,
    Stack,
    Tabs,
    TabsList,
    TabsPanel,
    TabsTab,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { PluginManifest } from "../../types/backend/plugin";
import { Resource } from "../../types/backend/resource";
import { DynamicIcon } from "../DynamicIcon";
import { startCase } from "lodash";
import { useTranslation } from "react-i18next";
import {
    IconCode,
    IconInfoCircleFilled,
    IconList,
    IconPlayerPlayFilled,
    IconPlaylistX,
    IconSearch,
    IconTagFilled,
} from "@tabler/icons-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ResourcePropertyIcon } from "./PropertyIcon";
import { ResourcePropertyRenderer } from "./renderers";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export function ResourceModal({
    resource,
    plugin,
    open,
    onClose,
}: {
    resource: Resource;
    plugin: PluginManifest;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [showHidden, { toggle: toggleHidden }] = useDisclosure(false);
    const [showEmpty, { toggle: toggleEmpty }] = useDisclosure(true);
    const [search, setSearch] = useState("");
    const showProps = Object.entries(resource.properties).filter(
        (v) =>
            (showHidden || !v[1].hidden) &&
            (showEmpty || v[1].value !== null) &&
            (search.length === 0 ||
                (v[1].label &&
                    (v[1].label.toLowerCase().includes(search.toLowerCase()) ||
                        search
                            .toLowerCase()
                            .includes(v[1].label.toLowerCase()))))
    );
    const [tab, setTab] = useState<"info" | "properties" | "execute">("info");
    return (
        <Modal
            className="raven-modal resource-modal"
            title={
                <Group gap="sm">
                    <DynamicIcon
                        size={32}
                        icon={resource.metadata.icon ?? "puzzle"}
                    />
                    <Stack gap={0}>
                        <Text size="lg">
                            {resource.metadata.display_name ??
                                startCase(resource.id)}
                        </Text>
                        <Badge size="xs">
                            {resource.metadata.category ??
                                t("views.resources.item.no_category")}
                        </Badge>
                    </Stack>
                </Group>
            }
            opened={open}
            size="90%"
            onClose={onClose}
        >
            <Tabs
                value={tab}
                onChange={(value) => setTab(value ?? ("info" as any))}
            >
                <TabsList>
                    <TabsTab
                        value="info"
                        leftSection={<IconInfoCircleFilled size={20} />}
                    >
                        {t("components.resources.modal.tab.info")}
                    </TabsTab>
                    <TabsTab
                        value="properties"
                        leftSection={<IconList size={20} />}
                    >
                        {t("components.resources.modal.tab.properties")}
                    </TabsTab>
                    <TabsTab
                        value="execute"
                        leftSection={<IconPlayerPlayFilled size={20} />}
                    >
                        {t("components.resources.modal.tab.execute")}
                    </TabsTab>
                </TabsList>

                <Space h="sm" />

                <TabsPanel value="info">
                    <Stack gap="sm">
                        <Fieldset
                            p="xs"
                            legend={
                                <Group gap={4}>
                                    <IconTagFilled size={14} />
                                    {t("components.resources.modal.tags_title")}
                                </Group>
                            }
                        >
                            {resource.metadata.tags.length > 0 ? (
                                <Group gap="xs">
                                    {resource.metadata.tags.map((v, i) => (
                                        <Badge variant="dot" key={i}>
                                            {v}
                                        </Badge>
                                    ))}
                                </Group>
                            ) : (
                                <Text c="dimmed" fs="italic">
                                    {t("components.resources.modal.no_tags")}
                                </Text>
                            )}
                        </Fieldset>
                        <Stack gap={2}>
                            <Text size="sm" fw={500}>
                                {t("components.resources.modal.plugin_title")}
                            </Text>
                            <Paper
                                p="xs"
                                className="resource-plugin paper-light"
                                shadow="xs"
                                radius="sm"
                            >
                                <Stack gap="xs">
                                    <Group gap="sm" wrap="nowrap">
                                        <DynamicIcon
                                            icon={plugin.icon ?? "puzzle"}
                                            size={24}
                                        />
                                        <Stack gap={0}>
                                            <Text size="sm">{plugin.name}</Text>
                                            <Text size="xs" c="dimmed">
                                                {plugin.slug}
                                            </Text>
                                        </Stack>
                                    </Group>
                                    {plugin.description && (
                                        <>
                                            <Divider />
                                            <Text size="sm">
                                                {plugin.description}
                                            </Text>
                                        </>
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Stack>
                </TabsPanel>
                <TabsPanel value="properties">
                    <Stack gap={2}>
                        <Text size="sm" fw={500}>
                            {t("components.resources.modal.properties_title")}
                        </Text>
                        <Paper p="xs" radius="sm" withBorder>
                            <Stack gap="sm" mah="50vh">
                                <Group gap="sm" wrap="nowrap">
                                    <TextInput
                                        leftSection={<IconSearch size={20} />}
                                        value={search}
                                        onChange={(ev) =>
                                            setSearch(ev.target.value)
                                        }
                                        style={{ flexGrow: 1 }}
                                    />
                                    <Tooltip
                                        label={t(
                                            "components.resources.modal.properties.hidden"
                                        )}
                                        withArrow
                                    >
                                        <ActionIcon
                                            variant={
                                                showHidden ? "filled" : "light"
                                            }
                                            onClick={toggleHidden}
                                            size="36"
                                        >
                                            <IconCode size={20} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip
                                        label={t(
                                            "components.resources.modal.properties.empty"
                                        )}
                                        withArrow
                                    >
                                        <ActionIcon
                                            variant={
                                                showEmpty ? "filled" : "light"
                                            }
                                            onClick={toggleEmpty}
                                            size="36"
                                        >
                                            <IconPlaylistX size={20} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                                <ScrollAreaAutosize offsetScrollbars>
                                    <ResponsiveMasonry
                                        columnsCountBreakPoints={{
                                            1: 1,
                                            1200: showProps.length >= 2 ? 2 : 1,
                                        }}
                                    >
                                        <Masonry gutter="12px">
                                            {showProps.map(([key, prop]) => (
                                                <Paper
                                                    className="paper-light"
                                                    p="sm"
                                                    radius="sm"
                                                    shadow="sm"
                                                    key={key}
                                                >
                                                    <Stack gap="sm">
                                                        <Group gap="sm">
                                                            {prop.icon ? (
                                                                <DynamicIcon
                                                                    icon={
                                                                        prop.icon as string
                                                                    }
                                                                    size={20}
                                                                />
                                                            ) : (
                                                                <ResourcePropertyIcon
                                                                    type={
                                                                        prop.type
                                                                    }
                                                                    size={20}
                                                                />
                                                            )}
                                                            <Stack gap={0}>
                                                                <Text size="sm">
                                                                    {prop.label}
                                                                </Text>
                                                                <Badge
                                                                    size="xs"
                                                                    variant="light"
                                                                >
                                                                    {prop.type}
                                                                </Badge>
                                                            </Stack>
                                                        </Group>
                                                        <ResourcePropertyRenderer
                                                            property={prop}
                                                        />
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Masonry>
                                    </ResponsiveMasonry>
                                </ScrollAreaAutosize>
                            </Stack>
                        </Paper>
                    </Stack>
                </TabsPanel>
            </Tabs>
        </Modal>
    );
}
