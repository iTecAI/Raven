import { StringFieldRenderer } from "./stringField";
import {
    FieldCreationFields,
    FieldCreationProps,
    IOFieldRenderer,
} from "./types";
export type { FieldCreationFields, FieldCreationProps, IOFieldRenderer };

export const FieldRenderers: { [key: string]: IOFieldRenderer<any> } = {
    string: StringFieldRenderer,
};
