import {
    Stack,
    Group,
    Text,
    Select,
    Switch,
    Fieldset,
    Popover,
    Button,
    TextInput,
    Paper,
    SimpleGrid,
    ActionIcon,
    MultiSelect,
} from "@mantine/core";
import {
    IconCheck,
    IconForms,
    IconKey,
    IconPlus,
    IconSelect,
    IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { SelectField } from "../../../../types/backend/pipeline";
import {
    FieldCreationProps,
    IOFieldRenderer,
    IORenderInputProps,
    IORenderOutputProps,
} from "./types";
import { EditorWrapper } from "./util";
import { useState } from "react";
import { isString } from "lodash";
import { useDisclosure } from "@mantine/hooks";

function SelectFieldEditor(props: FieldCreationProps<SelectField>) {
    const { t } = useTranslation();
    const [optValue, setOptValue] = useState("");
    const [optLabel, setOptLabel] = useState("");
    const [addingOption, { toggle: toggleAddOption, close: closeAddOption }] =
        useDisclosure(false);

    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.select.title")}
            icon={<IconSelect />}
        >
            {props.value.multiple ? (
                <MultiSelect
                    clearable
                    searchable
                    label={t("util.pipelines.io.meta.default")}
                    leftSection={<IconForms size={20} />}
                    value={
                        props.value.default_value
                            ? isString(props.value.default_value)
                                ? [props.value.default_value]
                                : props.value.default_value
                            : []
                    }
                    onChange={(value) =>
                        props.setValue({ default_value: value })
                    }
                    data={props.value.options}
                />
            ) : (
                <Select
                    clearable
                    searchable
                    label={t("util.pipelines.io.meta.default")}
                    leftSection={<IconForms size={20} />}
                    value={
                        props.value.default_value
                            ? isString(props.value.default_value)
                                ? props.value.default_value
                                : props.value.default_value[0] ?? null
                            : null
                    }
                    onChange={(value) =>
                        props.setValue({ default_value: value })
                    }
                    data={props.value.options}
                />
            )}
            <Group gap="sm" justify="space-between" style={{ flexGrow: 1 }}>
                <Text>{t("util.pipelines.io.field.switch.multiple")}</Text>
                <Switch
                    checked={props.value.multiple}
                    onClick={() =>
                        props.setValue({ multiple: !props.value.multiple })
                    }
                />
            </Group>
            <Fieldset
                legend={t("util.pipelines.io.field.select.options.title")}
                p="xs"
            >
                <Stack gap="xs">
                    {props.value.options.length > 0 && (
                        <SimpleGrid
                            cols={{
                                base: Math.min(props.value.options.length, 2),
                                sm: Math.min(props.value.options.length, 3),
                                md: Math.min(props.value.options.length, 4),
                                lg: Math.min(props.value.options.length, 6),
                            }}
                            verticalSpacing="xs"
                            spacing="xs"
                        >
                            {props.value.options.map((v) => {
                                const value = isString(v) ? v : v.value;
                                const label = isString(v) ? v : v.label;
                                return (
                                    <Paper
                                        p="xs"
                                        className="paper-light"
                                        key={value}
                                    >
                                        <Group
                                            gap="sm"
                                            justify="space-between"
                                            wrap="nowrap"
                                        >
                                            <Stack gap={0}>
                                                <Text size="sm">{label}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {value}
                                                </Text>
                                            </Stack>
                                            <ActionIcon
                                                variant="transparent"
                                                size="sm"
                                                color="gray"
                                                onClick={() =>
                                                    props.setValue({
                                                        options:
                                                            props.value.options.filter(
                                                                (v) =>
                                                                    isString(v)
                                                                        ? v !==
                                                                          value
                                                                        : v.value !==
                                                                          value,
                                                            ),
                                                    })
                                                }
                                            >
                                                <IconX size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Paper>
                                );
                            })}
                        </SimpleGrid>
                    )}
                    <Popover
                        width={"target"}
                        withArrow
                        position="top"
                        onClose={() => {
                            closeAddOption();
                            setOptLabel("");
                            setOptValue("");
                        }}
                        opened={addingOption}
                        closeOnClickOutside
                    >
                        <Popover.Target>
                            <Button
                                leftSection={<IconPlus size={20} />}
                                variant="light"
                                onClick={toggleAddOption}
                            >
                                {t(
                                    "util.pipelines.io.field.select.options.add",
                                )}
                            </Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Stack gap="xs">
                                <Group gap="sm">
                                    <IconPlus size={20} />
                                    <Text size="sm">
                                        {t(
                                            "util.pipelines.io.field.select.options.menu.title",
                                        )}
                                    </Text>
                                </Group>
                                <TextInput
                                    label={t(
                                        "util.pipelines.io.field.select.options.menu.value",
                                    )}
                                    size="xs"
                                    value={optValue}
                                    onChange={(ev) =>
                                        setOptValue(ev.target.value)
                                    }
                                    leftSection={<IconKey size={16} />}
                                />
                                <TextInput
                                    label={t(
                                        "util.pipelines.io.field.select.options.menu.label",
                                    )}
                                    size="xs"
                                    value={optLabel}
                                    onChange={(ev) =>
                                        setOptLabel(ev.target.value)
                                    }
                                    leftSection={<IconForms size={16} />}
                                />
                                <Group justify="end" gap="sm">
                                    <Button
                                        variant="light"
                                        size="xs"
                                        leftSection={<IconCheck size={16} />}
                                        disabled={
                                            optValue.length === 0 ||
                                            props.value.options
                                                .map((v) =>
                                                    isString(v) ? v : v.value,
                                                )
                                                .includes(optValue)
                                        }
                                        onClick={() => {
                                            props.setValue({
                                                options: [
                                                    ...props.value.options,
                                                    optLabel.length > 0
                                                        ? {
                                                              label: optLabel,
                                                              value: optValue,
                                                          }
                                                        : optValue,
                                                ],
                                            });
                                            toggleAddOption();
                                        }}
                                    >
                                        {t("common.action.create")}
                                    </Button>
                                </Group>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                </Stack>
            </Fieldset>
        </EditorWrapper>
    );
}

function SelectFieldInput(props: IORenderInputProps<SelectField>) {
    if (props.field.multiple) {
        return (
            <MultiSelect
                data={props.field.options}
                value={
                    props.value
                        ? isString(props.value)
                            ? [props.value]
                            : props.value
                        : []
                }
                onChange={props.onChange}
                clearable
                searchable
                leftSection={<IconSelect size={20} />}
                label={props.field.label}
            />
        );
    } else {
        return (
            <Select
                data={props.field.options}
                value={
                    props.value
                        ? isString(props.value)
                            ? props.value
                            : props.value[0] ?? null
                        : null
                }
                onChange={props.onChange}
                clearable
                searchable
                leftSection={<IconSelect size={20} />}
                label={props.field.label}
            />
        );
    }
}

function SelectFieldOutput(props: IORenderOutputProps<SelectField>) {
    if (props.field.multiple) {
        return (
            <MultiSelect
                data={props.field.options}
                value={
                    props.field.value
                        ? isString(props.field.value)
                            ? [props.field.value]
                            : props.field.value
                        : []
                }
                readOnly
                clearable
                searchable
                leftSection={<IconSelect size={20} />}
                label={props.field.label}
                variant="filled"
            />
        );
    } else {
        return (
            <Select
                data={props.field.options}
                value={
                    props.field.value
                        ? isString(props.field.value)
                            ? props.field.value
                            : props.field.value[0] ?? null
                        : null
                }
                readOnly
                variant="filled"
                clearable
                searchable
                leftSection={<IconSelect size={20} />}
                label={props.field.label}
            />
        );
    }
}

export const SelectFieldRenderer: IOFieldRenderer<SelectField> = {
    editor: SelectFieldEditor,
    render: {
        input: SelectFieldInput,
        output: SelectFieldOutput,
    },
};
