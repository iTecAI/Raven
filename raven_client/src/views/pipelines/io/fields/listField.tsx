import { TagsInput, NumberInput } from "@mantine/core";
import {
    IconForms,
    IconRuler2,
    IconSparkles,
    IconTagsFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ListField } from "../../../../types/backend/pipeline";
import { FieldCreationProps, IOFieldRenderer } from "./types";
import { EditorWrapper } from "./util";
import { isNumber } from "lodash";

function ListFieldEditor(props: FieldCreationProps<ListField>) {
    const { t } = useTranslation();
    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.list.title")}
            icon={<IconTagsFilled />}
        >
            <TagsInput
                leftSection={<IconForms size={20} />}
                label={t("util.pipelines.io.meta.default")}
                value={props.value.default_value ?? []}
                onChange={(value) => props.setValue({ default_value: value })}
                clearable
                data={props.value.suggestions ?? undefined}
                allowDuplicates
            />
            <TagsInput
                leftSection={<IconSparkles size={20} />}
                label={t("util.pipelines.io.field.list.suggestions")}
                value={props.value.suggestions ?? []}
                onChange={(value) => props.setValue({ suggestions: value })}
                clearable
                allowDuplicates={false}
            />
            <NumberInput
                leftSection={<IconRuler2 size={20} />}
                allowDecimal={false}
                allowNegative={false}
                value={props.value.max_length ?? ""}
                onChange={(value) =>
                    props.setValue({
                        max_length: isNumber(value) && value > 0 ? value : null,
                    })
                }
                label={t("util.pipelines.io.field.list.max_length")}
            />
        </EditorWrapper>
    );
}

export const ListFieldRenderer: IOFieldRenderer<ListField> = {
    editor: ListFieldEditor,
    render: {
        input: () => <></>,
        output: () => <></>,
    },
};
