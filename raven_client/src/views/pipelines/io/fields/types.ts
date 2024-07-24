import { ReactNode } from "react";
import { IOFieldTypes } from "../../../../types/backend/pipeline";

export type FieldCreationFields<T extends IOFieldTypes> = Omit<
    T,
    "type" | "value"
>;
export type FieldCreationProps<T extends IOFieldTypes> = {
    type: T["type"];
    value: FieldCreationFields<T>;
    setValue: (value: Partial<FieldCreationFields<T>>) => void;
    fields: Omit<IOFieldTypes, "value">[];
    collapsed: boolean;
};

export type IORenderInputProps<T extends IOFieldTypes> = {
    field: T;
    value: T["value"] | null;
    onChange: (value: T["value"] | null) => void;
};

export type IORenderOutputProps<T extends IOFieldTypes> = {
    field: T;
};

export type IOFieldRenderer<T extends IOFieldTypes> = {
    editor: (props: FieldCreationProps<T>) => ReactNode;
    render: {
        input: (props: IORenderInputProps<T>) => ReactNode;
        output: (props: IORenderOutputProps<T>) => ReactNode;
    };
};
