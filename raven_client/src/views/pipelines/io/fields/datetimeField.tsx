import {
    IconCalendar,
    IconCalendarClock,
    IconClock,
    IconForms,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { DatetimeField } from "../../../../types/backend/pipeline";
import {
    FieldCreationProps,
    IOFieldRenderer,
    IORenderInputProps,
    IORenderOutputProps,
} from "./types";
import { EditorWrapper } from "./util";
import { DatePickerInput, DateTimePicker, TimeInput } from "@mantine/dates";
import { Group, SegmentedControl, Text } from "@mantine/core";

function DatetimeFieldEditor(props: FieldCreationProps<DatetimeField>) {
    const { t } = useTranslation();
    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.datetime.title")}
            icon={<IconCalendarClock />}
        >
            {props.value.mode === "date" ? (
                <DatePickerInput
                    leftSection={<IconForms size={20} />}
                    label={t("util.pipelines.io.meta.default")}
                    value={
                        props.value.default_value
                            ? new Date(props.value.default_value)
                            : null
                    }
                    onChange={(value) =>
                        props.setValue({
                            default_value: value ? value.toISOString() : value,
                        })
                    }
                    valueFormat="MM/DD/YYYY"
                />
            ) : props.value.mode === "datetime" ? (
                <DateTimePicker
                    leftSection={<IconForms size={20} />}
                    label={t("util.pipelines.io.meta.default")}
                    value={
                        props.value.default_value
                            ? new Date(props.value.default_value)
                            : null
                    }
                    onChange={(value) =>
                        props.setValue({
                            default_value: value ? value.toISOString() : value,
                        })
                    }
                    valueFormat="MM/DD/YYYY hh:mm A"
                />
            ) : (
                <TimeInput
                    leftSection={<IconForms size={20} />}
                    label={t("util.pipelines.io.meta.default")}
                    value={props.value.default_value ?? ""}
                    onChange={(ev) =>
                        props.setValue({
                            default_value: ev.target.value,
                        })
                    }
                />
            )}
            <SegmentedControl
                value={props.value.mode}
                onChange={(value) => props.setValue({ mode: value as any })}
                data={[
                    {
                        value: "datetime",
                        label: (
                            <Group gap="xs">
                                <IconCalendarClock size={16} />
                                <Text size="xs">
                                    {t(
                                        "util.pipelines.io.field.datetime.mode.datetime",
                                    )}
                                </Text>
                            </Group>
                        ),
                    },
                    {
                        value: "date",
                        label: (
                            <Group gap="xs">
                                <IconCalendar size={16} />
                                <Text size="xs">
                                    {t(
                                        "util.pipelines.io.field.datetime.mode.date",
                                    )}
                                </Text>
                            </Group>
                        ),
                    },
                    {
                        value: "time",
                        label: (
                            <Group gap="xs">
                                <IconClock size={16} />
                                <Text size="xs">
                                    {t(
                                        "util.pipelines.io.field.datetime.mode.time",
                                    )}
                                </Text>
                            </Group>
                        ),
                    },
                ]}
            />
        </EditorWrapper>
    );
}

function DatetimeFieldInput(props: IORenderInputProps<DatetimeField>) {
    switch (props.field.mode) {
        case "date":
            return (
                <DatePickerInput
                    value={props.value ? new Date(props.value) : null}
                    onChange={(value) =>
                        props.onChange(value ? value.toISOString() : null)
                    }
                    label={props.field.label}
                    leftSection={<IconCalendar size={20} />}
                    valueFormat="MM/DD/YYYY"
                />
            );
        case "datetime":
            return (
                <DateTimePicker
                    value={props.value ? new Date(props.value) : null}
                    onChange={(value) =>
                        props.onChange(value ? value.toISOString() : null)
                    }
                    label={props.field.label}
                    leftSection={<IconCalendarClock size={20} />}
                    valueFormat="MM/DD/YYYY hh:mm A"
                />
            );
        case "time":
            return (
                <TimeInput
                    value={props.value ?? ""}
                    onChange={(event) =>
                        props.onChange(
                            event.target.value.length > 0
                                ? event.target.value
                                : null,
                        )
                    }
                    label={props.field.label}
                    leftSection={<IconClock size={20} />}
                />
            );
    }
}

function DatetimeFieldOutput(props: IORenderOutputProps<DatetimeField>) {
    switch (props.field.mode) {
        case "date":
            return (
                <DatePickerInput
                    value={
                        props.field.value ? new Date(props.field.value) : null
                    }
                    readOnly
                    label={props.field.label}
                    leftSection={<IconCalendar size={20} />}
                    valueFormat="MM/DD/YYYY"
                    variant="filled"
                />
            );
        case "datetime":
            return (
                <DateTimePicker
                    value={
                        props.field.value ? new Date(props.field.value) : null
                    }
                    readOnly
                    label={props.field.label}
                    leftSection={<IconCalendarClock size={20} />}
                    valueFormat="MM/DD/YYYY hh:mm A"
                    variant="filled"
                />
            );
        case "time":
            return (
                <TimeInput
                    value={props.field.value ?? ""}
                    readOnly
                    label={props.field.label}
                    leftSection={<IconClock size={20} />}
                    variant="filled"
                />
            );
    }
}

export const DatetimeFieldRenderer: IOFieldRenderer<DatetimeField> = {
    editor: DatetimeFieldEditor,
    render: {
        input: DatetimeFieldInput,
        output: DatetimeFieldOutput,
    },
};
