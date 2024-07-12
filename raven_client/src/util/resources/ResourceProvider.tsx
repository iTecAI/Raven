import { ReactNode, useCallback, useEffect } from "react";
import { ResourceMixin, useApi, useScoped } from "../api";
import { ResourceContext } from "./types";
import { useListState } from "@mantine/hooks";
import { Resource } from "../../types/backend/resource";
import { Event, useEvent } from "../events";

function AuthenticatedResourceProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const api = useApi(ResourceMixin);
    const [resources, resourceMethods] = useListState<Resource>([]);

    useEffect(() => {
        if (api.state === "ready" && api.auth?.user) {
            api.methods.list_resources().then((values) => {
                resourceMethods.setState(values);
            });
        } else {
            resourceMethods.setState([]);
        }
    }, [api.auth?.user?.id, api.state]);

    const onUpdate = useCallback(
        (event: Event<{ entity_id: string }>) => {
            if (event.plugin) {
                api.methods
                    .get_resource(event.plugin, event.data.entity_id)
                    .then((result) => {
                        if (result) {
                            resourceMethods.applyWhere(
                                (item) =>
                                    item.id === event.data.entity_id &&
                                    item.plugin === event.plugin,
                                () => result,
                            );
                        }
                    });
            }
        },
        [resourceMethods.applyWhere],
    );

    useEvent("resource.update", onUpdate);

    return (
        <ResourceContext.Provider value={resources}>
            {children}
        </ResourceContext.Provider>
    );
}

export function ResourceProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const scoped = useScoped(["resources.all.*", "resources.plugin.*"]);
    if (scoped) {
        return (
            <AuthenticatedResourceProvider>
                {children}
            </AuthenticatedResourceProvider>
        );
    } else {
        return (
            <ResourceContext.Provider value={[]}>
                {children}
            </ResourceContext.Provider>
        );
    }
}
