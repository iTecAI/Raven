import { useDisclosure, useInputState } from "@mantine/hooks";
import { PluginMixin, ResourceMixin, useApi, useScoped } from "../../util/api";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
    ActionIcon,
    Badge,
    Group,
    MultiSelect,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PluginManifest } from "../../types/backend/plugin";
import { DynamicIcon } from "../../components/DynamicIcon";
import { capitalize, startCase } from "lodash";
import {
    IconCategoryFilled,
    IconDotsVertical,
    IconPuzzle,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import { ResourcePropertyIcon } from "../../components/resource/PropertyIcon";
import { ResourcePropertyRenderer } from "../../components/resource/renderers";
import { ResourceModal } from "../../components/resource/ResourceModal";
import { useResource, useResources } from "../../util/resources";
import { useIsMobile } from "../../util/hooks";

const ResourceItem = memo(
    ({
        resource_id,
        plugin,
    }: {
        resource_id: string;
        plugin: PluginManifest;
    }) => {
        const resource = useResource(resource_id);

        const { t } = useTranslation();
        const [options, { close: closeModal, open: openModal }] =
            useDisclosure(false);
        return resource ? (
            <Paper
                p="sm"
                className="paper-light resource-item"
                shadow="sm"
                radius="sm"
            >
                <ResourceModal
                    resource={resource}
                    plugin={plugin}
                    open={options}
                    onClose={closeModal}
                />
                <Stack gap="sm">
                    <Group
                        gap="sm"
                        justify="space-between"
                        wrap="nowrap"
                        align="start"
                    >
                        <Group gap="sm" wrap="nowrap">
                            <DynamicIcon
                                icon={resource.metadata.icon ?? "puzzle"}
                            />
                            <Stack gap={0}>
                                <Text size="sm" lineClamp={1} fw={600}>
                                    {resource.metadata.display_name ??
                                        startCase(resource.id)}
                                </Text>
                                <Badge size="xs">
                                    {resource.metadata.category ??
                                        t("views.resources.item.no_category")}
                                </Badge>
                            </Stack>
                        </Group>
                        <ActionIcon
                            variant="transparent"
                            radius="xl"
                            onClick={() => openModal()}
                        >
                            <IconDotsVertical size={20} />
                        </ActionIcon>
                    </Group>

                    <Paper
                        withBorder
                        className="resource-state paper-light"
                        p="xs"
                        radius="sm"
                        shadow="0"
                    >
                        <Stack gap="sm">
                            <Group gap="sm">
                                {resource.properties[resource.state_key]
                                    .icon ? (
                                    <DynamicIcon
                                        icon={
                                            resource.properties[
                                                resource.state_key
                                            ].icon as string
                                        }
                                        size={20}
                                    />
                                ) : (
                                    <ResourcePropertyIcon
                                        type={
                                            resource.properties[
                                                resource.state_key
                                            ].type
                                        }
                                        size={20}
                                    />
                                )}
                                <Stack gap={0}>
                                    <Text size="sm">
                                        {
                                            resource.properties[
                                                resource.state_key
                                            ].label
                                        }
                                    </Text>
                                    <Badge size="xs" variant="light">
                                        {
                                            resource.properties[
                                                resource.state_key
                                            ].type
                                        }
                                    </Badge>
                                </Stack>
                            </Group>
                            <ResourcePropertyRenderer
                                property={
                                    resource.properties[resource.state_key]
                                }
                            />
                        </Stack>
                    </Paper>
                    <Paper
                        p="xs"
                        className="resource-plugin"
                        shadow="xs"
                        radius="sm"
                    >
                        <Group gap="sm" wrap="nowrap">
                            <DynamicIcon
                                icon={plugin.icon ?? "puzzle"}
                                fallback={IconPuzzle}
                                size={20}
                            />
                            <Stack gap={0}>
                                <Text size="xs">{plugin.name}</Text>
                                <Text size="xs" c="dimmed">
                                    {plugin.slug}
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>
                </Stack>
            </Paper>
        ) : (
            <></>
        );
    },
);

export function ResourceView() {
    const canView = useScoped(["resources.*"]);
    const api = useApi(ResourceMixin, PluginMixin);
    const { t } = useTranslation();
    const nav = useNavigate();

    const [plugins, setPlugins] = useState<{ [key: string]: PluginManifest }>(
        {},
    );

    const [search, setSearch] = useInputState("");

    const loadPlugins = useCallback(() => {
        if (api.auth?.user?.id && canView) {
            api.methods.list_plugins().then(setPlugins);
        } else {
            setPlugins({});
        }
    }, [api.state, api.auth?.user?.id, canView, setPlugins]);

    const resources = useResources();

    useEffect(() => {
        loadPlugins();
    }, [loadPlugins]);

    useEffect(() => {
        if (!canView && api.state === "ready") {
            nav("/");
        }
    }, [canView, api.state]);

    const categories = useMemo(() => {
        const result: string[] = [];
        resources.forEach((v) => {
            if (v.metadata.category && !result.includes(v.metadata.category)) {
                result.push(v.metadata.category);
            }
        });
        return result;
    }, [resources]);

    const tags = useMemo(() => {
        const result: string[] = [];
        resources.forEach((v) => {
            for (const tag of v.metadata.tags) {
                if (!result.includes(tag)) {
                    result.push(tag);
                }
            }
        });
        return result;
    }, [resources]);

    const [filters, setFilters] = useState<
        (`tag:${string}` | `category:${string}` | `plugin:${string}`)[]
    >([]);

    const mobile = useIsMobile();
    const actualFilterValue = mobile ? [] : filters;

    return (
        <Stack gap="md" className="resource-view" p="md">
            <Group gap="sm" wrap="nowrap" className="resource-menu">
                <TextInput
                    leftSection={<IconSearch size={20} />}
                    value={search}
                    onChange={setSearch}
                    style={{ flexGrow: 3 }}
                    rightSection={
                        search.length > 0 ? (
                            <ActionIcon
                                size="sm"
                                variant="transparent"
                                color="dark"
                                onClick={() => setSearch("")}
                            >
                                <IconX size={20} />
                            </ActionIcon>
                        ) : undefined
                    }
                />
                {!mobile && (
                    <MultiSelect
                        leftSection={<IconCategoryFilled size={20} />}
                        value={filters}
                        onChange={(v) => setFilters(v as any)}
                        style={{ flexGrow: 1, minWidth: "192px" }}
                        data={[
                            {
                                group: t("views.resource.search.group.plugin"),
                                items: Object.keys(plugins).map((v) => ({
                                    label: plugins[v].name,
                                    value: `plugin:${v}`,
                                })),
                            },
                            {
                                group: t(
                                    "views.resource.search.group.category",
                                ),
                                items: categories.map((v) => ({
                                    label: capitalize(v),
                                    value: `category:${v}`,
                                })),
                            },
                            {
                                group: t("views.resource.search.group.tag"),
                                items: tags.map((v) => ({
                                    label: capitalize(v),
                                    value: `tag:${v}`,
                                })),
                            },
                        ]}
                    />
                )}
            </Group>
            <Paper withBorder p="sm" className="resource-list">
                <ScrollArea className="resource-scroll">
                    <ResponsiveMasonry
                        className="resource-list"
                        columnsCountBreakPoints={{
                            576: 1,
                            768: 1,
                            992: 2,
                            1200: 3,
                            1408: 4,
                        }}
                    >
                        <Masonry gutter="12px">
                            {resources
                                .filter((v) => plugins[v.plugin] !== undefined)
                                .filter(
                                    (v) =>
                                        (search.length === 0 ||
                                            search
                                                .toLowerCase()
                                                .includes(
                                                    (
                                                        v.metadata
                                                            .display_name ??
                                                        v.id
                                                    ).toLowerCase(),
                                                ) ||
                                            (v.metadata.display_name ?? v.id)
                                                .toLowerCase()
                                                .includes(
                                                    search.toLowerCase(),
                                                )) &&
                                        (actualFilterValue.length === 0 ||
                                            actualFilterValue
                                                .map((f) =>
                                                    f.startsWith("tag:")
                                                        ? v.metadata.tags.includes(
                                                              f.split(
                                                                  ":",
                                                                  2,
                                                              )[1],
                                                          )
                                                        : f.startsWith(
                                                                "category:",
                                                            )
                                                          ? v.metadata
                                                                .category ===
                                                            f.split(":", 2)[1]
                                                          : v.plugin ===
                                                            f.split(":", 2)[1],
                                                )
                                                .includes(true)),
                                )
                                .map((resource) => (
                                    <ResourceItem
                                        resource_id={resource.id}
                                        plugin={plugins[resource.plugin]}
                                        key={`${resource.plugin}:${resource.id}`}
                                    />
                                ))}
                        </Masonry>
                    </ResponsiveMasonry>
                </ScrollArea>
            </Paper>
        </Stack>
    );
}
