import { useContext, useMemo } from "react";
import { Resource } from "../../types/backend/resource";
import { ResourceContext } from "./types";
import { ResourceProvider } from "./ResourceProvider";

export function useResources(): Resource[] {
    return useContext(ResourceContext);
}

export function useResource(id: string): Resource | null {
    const resources = useResources();
    const result = useMemo(() => {
        return resources.find((v) => v.id === id) ?? null;
    }, [id, resources]);
    return result;
}

export { ResourceProvider };
