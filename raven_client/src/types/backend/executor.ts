export interface ArrayArgument {
    type: "array";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    max_values?: number | null;
    suggestions?: string[] | null;
}

export interface BooleanArgument {
    type: "boolean";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    mode?: "checkbox" | "switch";
}

export interface ExecArgument {
    type: null;
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
}

export interface ConstantArgument {
    type: "constant";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    value?: any;
}

export interface ExecutionTarget {
    categories?: string | string[] | null;
    tags?: (string | string[])[] | string | null;
    id?: string | string[] | null;
    fragment?: {
        [k: string]: unknown;
    } | null;
}

export type ExecArgumentType =
    | BooleanArgument
    | StringArgument
    | NumberArgument
    | ObjectArgument
    | SelectionArgument
    | ArrayArgument
    | ResourceArgument
    | ColorArgument
    | ConstantArgument
    | DatetimeArgument
    | DurationArgument;

export interface Executor {
    id: string;
    plugin: string;
    export: string;
    name: string;
    description?: string | null;
    targets?: (ExecutionTarget | ExecutionTarget[])[] | null;
    arguments?: {
        [k: string]: ExecArgumentType;
    };
}

export interface StringArgument {
    type: "string";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    multiline?: boolean;
    password?: boolean;
    suggestions?: string[] | null;
    mode: "normal" | "suggesting" | "multiline" | "password";
}

export interface NumberArgument {
    type: "number";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    prefix?: string | null;
    suffix?: string | null;
    min?: number | null;
    max?: number | null;
    negatives?: boolean;
    decimals?: boolean;
    precision?: number | null;
}

export interface ObjectArgument {
    type: "object";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
}

export interface DatetimeArgument {
    type: "datetime";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    mode: "datetime" | "date" | "time";
}

export interface DurationArgument {
    type: "duration";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    days: boolean;
    negatives: boolean;
}

export interface SelectionArgument {
    type: "selection";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    options?: (string | { label: string; value: string })[];
    multiple?: boolean;
}

export interface ResourceArgument {
    type: "resource";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    targets?: ExecutionTarget[] | null;
    multiple: boolean;
}

export interface ColorArgument {
    type: "color";
    name: string;
    label?: string | null;
    description?: string | null;
    placeholder?: string | null;
    icon?: string | null;
    advanced?: boolean;
    required?: boolean;
    format: "HEX" | "HEXA" | "RGB" | "RGBA" | "HSL" | "HSLA";
}
