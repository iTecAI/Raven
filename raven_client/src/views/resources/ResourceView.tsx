import { useListState } from "@mantine/hooks";
import { PluginMixin, ResourceMixin, useApi, useScoped } from "../../util/api";
import { Resource } from "../../types/backend/resource";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Paper } from "@mantine/core";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PluginManifest } from "../../types/backend/plugin";

const ResourceItem = memo(
    ({ resource, plugin }: { resource: Resource; plugin: PluginManifest }) => {
        return (
            <Paper
                p="sm"
                className="paper-light resource-item"
                shadow="sm"
                radius="sm"
            ></Paper>
        );
    }
);

export function ResourceView() {
    const canView = useScoped(["resources.*"]);
    const canExecute = useScoped([
        "resources.all.execute",
        "resources.plugin.*.execute",
    ]);
    const api = useApi(ResourceMixin, PluginMixin);
    const { t } = useTranslation();
    const nav = useNavigate();

    const [resources, resourceMethods] = useListState<Resource>([]);
    const [plugins, setPlugins] = useState<{ [key: string]: PluginManifest }>(
        {}
    );

    const loadPlugins = useCallback(() => {
        if (api.auth?.user?.id && canView) {
            api.methods.list_plugins().then(setPlugins);
        } else {
            setPlugins({});
        }
    }, [api.state, api.auth?.user?.id, canView, setPlugins]);

    const loadResources = useCallback(() => {
        if (api.auth?.user?.id && canView) {
            api.methods.list_resources().then(resourceMethods.setState);
        } else {
            resourceMethods.setState([]);
        }
    }, [api.state, api.auth?.user?.id, resourceMethods.setState, canView]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    useEffect(() => {
        loadPlugins();
    }, [loadPlugins]);

    useEffect(() => {
        if (!canView && api.state === "ready") {
            nav("/");
        }
    }, [canView, api.state]);

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
                {resources.map((resource) => (
                    <ResourceItem
                        resource={resource}
                        plugin={plugins[resource.plugin]}
                        key={`${resource.plugin}:${resource.id}`}
                    />
                ))}
            </Masonry>
        </ResponsiveMasonry>
    );
}
