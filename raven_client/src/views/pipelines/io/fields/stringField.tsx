import {
    Group,
    NumberInput,
    Switch,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { StringField } from "../../../../types/backend/pipeline";
import {
    FieldCreationProps,
    IOFieldRenderer,
    IORenderInputProps,
    IORenderOutputProps,
} from "./types";
import { EditorWrapper } from "./util";
import { useTranslation } from "react-i18next";
import {
    IconForms,
    IconLetterCase,
    IconRuler2,
    IconTextWrap,
} from "@tabler/icons-react";
import { isNumber } from "lodash";

function StringFieldEditor(props: FieldCreationProps<StringField>) {
    const { t } = useTranslation();
    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.string.title")}
            icon={<IconLetterCase />}
        >
            {props.value.multiline ? (
                <Textarea
                    leftSection={<IconForms size={20} />}
                    label={t("util.pipelines.io.meta.default")}
                    value={props.value.default_value ?? ""}
                    onChange={(v) =>
                        props.setValue({ default_value: v.target.value })
                    }
                    autosize
                    maxRows={4}
                />
            ) : (
                <TextInput
                    leftSection={<IconForms size={20} />}
                    label={t("util.pipelines.io.meta.default")}
                    value={props.value.default_value ?? ""}
                    onChange={(v) =>
                        props.setValue({ default_value: v.target.value })
                    }
                />
            )}
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
                label={t("util.pipelines.io.field.string.max_length")}
            />

            <Group gap="sm" justify="space-between">
                <Group gap="sm">
                    <IconTextWrap />
                    <Text>{t("util.pipelines.io.field.string.multiline")}</Text>
                </Group>
                <Switch
                    checked={props.value.multiline}
                    onClick={() =>
                        props.setValue({ multiline: !props.value.multiline })
                    }
                />
            </Group>
        </EditorWrapper>
    );
}

function StringFieldInput(props: IORenderInputProps<StringField>) {
    if (props.field.multiline) {
        return (
            <Textarea
                autosize
                maxRows={6}
                leftSection={<IconLetterCase size={20} />}
                value={props.value ?? ""}
                onChange={(ev) => props.onChange(ev.target.value)}
                label={props.field.label}
                maxLength={props.field.max_length ?? undefined}
            />
        );
    } else {
        return (
            <TextInput
                leftSection={<IconLetterCase size={20} />}
                value={props.value ?? ""}
                onChange={(ev) => props.onChange(ev.target.value)}
                label={props.field.label}
                maxLength={props.field.max_length ?? undefined}
            />
        );
    }
}

function StringFieldOutput(props: IORenderOutputProps<StringField>) {
    if (props.field.multiline) {
        return (
            <Textarea
                autosize
                maxRows={6}
                leftSection={<IconLetterCase size={20} />}
                value={props.field.value ?? ""}
                label={props.field.label}
                maxLength={props.field.max_length ?? undefined}
                readOnly
                variant="filled"
            />
        );
    } else {
        return (
            <TextInput
                leftSection={<IconLetterCase size={20} />}
                value={props.field.value ?? ""}
                label={props.field.label}
                maxLength={props.field.max_length ?? undefined}
                variant="filled"
            />
        );
    }
}

export const StringFieldRenderer: IOFieldRenderer<StringField> = {
    editor: StringFieldEditor,
    render: {
        input: StringFieldInput,
        output: StringFieldOutput,
    },
};
