interface BaseExport {
    type: string;
    import_path: string | null;
    member: string;
}

export interface LifecycleExport extends BaseExport {
    type: "lifecycle";
    context_key: string;
    is_async: boolean;
}

export interface ResourceExport extends BaseExport {
    type: "resource";
    is_async: boolean;
    kwargs: { [key: string]: string };
}

export type PluginExport = LifecycleExport | ResourceExport;

export type PluginDependency = {
    name: string;
    ref: string;
    source: "git" | "pip" | null;
};

export type PluginManifest = {
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    dependencies: PluginDependency[];
    entrypoint: string;
    exports: { [key: string]: PluginExport };
};
