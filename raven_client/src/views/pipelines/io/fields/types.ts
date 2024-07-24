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
};
export type IOFieldRenderer<T extends IOFieldTypes> = {
    editor: (props: FieldCreationProps<T>) => ReactNode;
    render: {
        input: (props: {
            field: T;
            onChange: (value: T["value"] | null) => void;
        }) => ReactNode;
        output: (props: { field: T }) => ReactNode;
    };
};
