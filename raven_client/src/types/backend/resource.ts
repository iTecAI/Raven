export enum ResourcePropertyType {
    OBJECT = "object",
    TEXT = "text",
    NUMBER = "number",
    BOOLEAN = "boolean",
    DATE = "date",
    TIME = "time",
    DATETIME = "datetime",
    COLOR = "color",
    OPTION = "option",
    LIST = "list",
}

export type ResourceProperty<T = any> = {
    label: string | null;
    type: ResourcePropertyType;
    value: T;
    icon: string | null;
    suffix: string | null;
    prefix: string | null;
    hidden: string | null;
};

export type ResourceMetadata = {
    display_name: string | null;
    icon: string | null;
    category: string | null;
    tags: string[];
};

export type Resource = {
    id: string;
    plugin: string;
    metadata: ResourceMetadata;
    properties: { [key: string]: ResourceProperty };
    state_key: string;
};
