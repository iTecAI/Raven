import { Group, Text, NumberInput, Switch, Divider } from "@mantine/core";
import {
    IconForms,
    IconMathEqualGreater,
    IconMathEqualLower,
    IconNumber,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { NumberField } from "../../../../types/backend/pipeline";
import {
    FieldCreationProps,
    IOFieldRenderer,
    IORenderInputProps,
    IORenderOutputProps,
} from "./types";
import { EditorWrapper } from "./util";
import { isNumber } from "lodash";

function NumberFieldEditor(props: FieldCreationProps<NumberField>) {
    const { t } = useTranslation();
    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.number.title")}
            icon={<IconNumber />}
        >
            <NumberInput
                value={props.value.default_value ?? ""}
                onChange={(value) =>
                    props.setValue({
                        default_value: isNumber(value) ? value : null,
                    })
                }
                label={t("util.pipelines.io.meta.default")}
                leftSection={<IconForms size={20} />}
            />
            <Group gap="sm" grow>
                <NumberInput
                    value={props.value.min ?? ""}
                    onChange={(value) =>
                        props.setValue({
                            min: isNumber(value) ? value : null,
                        })
                    }
                    label={t("util.pipelines.io.field.number.min")}
                    leftSection={<IconMathEqualGreater size={20} />}
                />
                <NumberInput
                    value={props.value.max ?? ""}
                    onChange={(value) =>
                        props.setValue({
                            max: isNumber(value) ? value : null,
                        })
                    }
                    label={t("util.pipelines.io.field.number.max")}
                    leftSection={<IconMathEqualLower size={20} />}
                />
            </Group>
            <Group gap="sm">
                <Group gap="sm" justify="space-between" style={{ flexGrow: 1 }}>
                    <Text>{t("util.pipelines.io.field.number.decimals")}</Text>
                    <Switch
                        checked={props.value.decimals}
                        onClick={() =>
                            props.setValue({ decimals: !props.value.decimals })
                        }
                    />
                </Group>
                <Divider orientation="vertical" />
                <Group gap="sm" justify="space-between" style={{ flexGrow: 1 }}>
                    <Text>{t("util.pipelines.io.field.number.negatives")}</Text>
                    <Switch
                        checked={props.value.negatives}
                        onClick={() =>
                            props.setValue({
                                negatives: !props.value.negatives,
                            })
                        }
                    />
                </Group>
            </Group>
        </EditorWrapper>
    );
}

function NumberFieldInput(props: IORenderInputProps<NumberField>) {
    return (
        <NumberInput
            label={props.field.label}
            value={props.value ?? ""}
            onChange={(value) =>
                isNumber(value) ? props.onChange(value) : props.onChange(null)
            }
            allowDecimal={props.field.decimals}
            allowNegative={props.field.negatives}
            min={props.field.min ?? undefined}
            max={props.field.max ?? undefined}
            leftSection={<IconNumber size={20} />}
        />
    );
}

function NumberFieldOutput(props: IORenderOutputProps<NumberField>) {
    return (
        <NumberInput
            label={props.field.label}
            value={props.field.value ?? ""}
            readOnly
            variant="filled"
            leftSection={<IconNumber size={20} />}
        />
    );
}

export const NumberFieldRenderer: IOFieldRenderer<NumberField> = {
    editor: NumberFieldEditor,
    render: {
        input: NumberFieldInput,
        output: NumberFieldOutput,
    },
};
