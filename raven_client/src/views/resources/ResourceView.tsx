import { useDisclosure, useListState } from "@mantine/hooks";
import { PluginMixin, ResourceMixin, useApi, useScoped } from "../../util/api";
import { Resource } from "../../types/backend/resource";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PluginManifest } from "../../types/backend/plugin";
import { DynamicIcon } from "../../components/DynamicIcon";
import { startCase } from "lodash";
import { IconDotsVertical, IconPuzzle } from "@tabler/icons-react";
import { ResourcePropertyIcon } from "../../components/resource/PropertyIcon";
import { ResourcePropertyRenderer } from "../../components/resource/renderers";
import { ResourceModal } from "../../components/resource/ResourceModal";
import { useResource, useResources } from "../../util/resources";

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

    return (
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
                    .map((resource) => (
                        <ResourceItem
                            resource_id={resource.id}
                            plugin={plugins[resource.plugin]}
                            key={`${resource.plugin}:${resource.id}`}
                        />
                    ))}
            </Masonry>
        </ResponsiveMasonry>
    );
}
