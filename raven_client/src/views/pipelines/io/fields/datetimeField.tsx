import {
    IconCalendar,
    IconCalendarClock,
    IconClock,
    IconForms,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { DatetimeField } from "../../../../types/backend/pipeline";
import { FieldCreationProps, IOFieldRenderer } from "./types";
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

export const DatetimeFieldRenderer: IOFieldRenderer<DatetimeField> = {
    editor: DatetimeFieldEditor,
    render: {
        input: () => <></>,
        output: () => <></>,
    },
};
