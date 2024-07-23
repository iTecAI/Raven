interface BaseField<T = any> {
    key: string;
    label: string;
    value: T | null;
    default_value: T | null;
}

export interface StringField extends BaseField<string> {
    type: "string";
    multiline: boolean;
    max_length: number | null;
}

export interface NumberField extends BaseField<number> {
    type: "number";
    decimals: boolean;
    min: number | null;
    max: number | null;
}

export interface SwitchField extends BaseField<boolean> {
    type: "switch";
}

export interface SelectField extends BaseField<string | string[]> {
    type: "select";
    options: (string | {label: string; value: string})[];
    multiple: boolean;
}

export interface ListField extends BaseField<string[]> {
    type: "list";
    suggestions: string[] | null;
    max_length: number | null;
}

export interface ColorField extends BaseField<string> {
    type: "color";
    alpha: boolean;
    rgb: [number, number, number] | [number, number, number, number];
    hls: [number, number, number] | [number, number, number, number];
    hsv: [number, number, number] | [number, number, number, number];
}

export interface DatetimeField extends BaseField<string> {
    type: "datetime";
    mode: "datetime" | "date" | "time";
}

export type IOFieldTypes = StringField | NumberField | SwitchField | SelectField | ListField | ColorField | DatetimeField;

interface BasePipelineIO {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
}

export interface PipelineTriggerIO extends BasePipelineIO {
    type: "trigger";
    label: string | null;
}

export interface PipelineDataIO extends BasePipelineIO {
    type: "data";
    fields: IOFieldTypes[];
}

export type PipelineIO = PipelineDataIO | PipelineTriggerIO;