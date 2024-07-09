import {
    Autocomplete,
    Button,
    Checkbox,
    ColorInput,
    Divider,
    Fieldset,
    Group,
    JsonInput,
    MultiSelect,
    NumberInput,
    Paper,
    PasswordInput,
    Select,
    Stack,
    Switch,
    TagsInput,
    Text,
    Textarea,
    TextInput,
    useMantineTheme,
} from "@mantine/core";
import {
    ExecArgumentType,
    Executor,
    ResourceArgument,
} from "../../types/backend/executor";
import { Resource } from "../../types/backend/resource";
import { DynamicIcon } from "../DynamicIcon";
import {
    IconBraces,
    IconCalendarFilled,
    IconClockFilled,
    IconEdit,
    IconInfoCircleFilled,
    IconLock,
    IconNumber,
    IconPalette,
    IconPlayerPlayFilled,
    IconPuzzle,
    IconSelect,
    IconSettings,
    IconSettingsOff,
    IconTagsFilled,
    IconX,
} from "@tabler/icons-react";
import { DateInput, DateTimePicker, TimeInput } from "@mantine/dates";
import { isNumber, omit } from "lodash";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { ResourceMixin, useApi } from "../../util/api";
import { useTranslation } from "react-i18next";

function ResourcePicker({
    field,
    value,
    onChange,
}: {
    field: ResourceArgument;
    value: any;
    onChange: (value: any) => void;
}) {
    const api = useApi(ResourceMixin);
    const [results, setResults] = useState<Resource[]>([]);
    const targetCheck = JSON.stringify(field.targets ?? {});

    useEffect(() => {
        if (api.state === "ready") {
            api.methods
                .get_resources_by_target(field.targets ?? [])
                .then(setResults);
        } else {
            setResults([]);
        }
    }, [targetCheck, api.state]);

    const options = results.map((v) => ({
        label: v.metadata.display_name ?? v.id,
        value: v.id,
    }));
    const genericProps = {
        label: field.label ?? undefined,
        placeholder: field.placeholder ?? undefined,
        value: value,
        onChange: onChange,
        withAsterisk: field.required,
        description: field.description,
    };
    if (field.multiple) {
        return (
            <MultiSelect
                data={options}
                leftSection={
                    <DynamicIcon
                        icon={field.icon ?? "puzzle"}
                        fallback={IconPuzzle}
                        size={20}
                    />
                }
                {...genericProps}
                searchable
                clearable
            />
        );
    } else {
        return (
            <Select
                data={options}
                leftSection={
                    <DynamicIcon
                        icon={field.icon ?? "puzzle"}
                        fallback={IconPuzzle}
                        size={20}
                    />
                }
                {...genericProps}
                searchable
                clearable
            />
        );
    }
}

function ExecutionField({
    field,
    value,
    onChange,
}: {
    resource: Resource;
    executor: Executor;
    field: ExecArgumentType;
    value: any;
    onChange: (value: any) => void;
}) {
    const genericProps = {
        label: field.label ?? undefined,
        placeholder: field.placeholder ?? undefined,
        value: value,
        onChange: onChange,
        withAsterisk: field.required,
        description: field.description,
    };
    switch (field.type) {
        case "array":
            return (
                <TagsInput
                    leftSection={
                        <DynamicIcon
                            icon={field.icon ?? "tags-filled"}
                            fallback={IconTagsFilled}
                            size={20}
                        />
                    }
                    maxTags={field.max_values ?? undefined}
                    data={field.suggestions ?? undefined}
                    {...genericProps}
                />
            );
        case "boolean":
            if (field.mode === "checkbox") {
                return (
                    <Checkbox
                        checked={Boolean(value)}
                        onChange={(event) => onChange(event.target.checked)}
                        label={genericProps.label}
                        required={genericProps.withAsterisk}
                    />
                );
            } else {
                return (
                    <Switch
                        checked={Boolean(value)}
                        onChange={(event) => onChange(event.target.checked)}
                        label={genericProps.label}
                        required={genericProps.withAsterisk}
                    />
                );
            }
        case "color":
            return (
                <ColorInput
                    format={(field.format ?? "RGB").toLowerCase() as any}
                    value={value ?? ""}
                    leftSection={
                        <DynamicIcon
                            icon={field.icon ?? "palette"}
                            fallback={IconPalette}
                            size={20}
                        />
                    }
                    {...omit(genericProps, "value")}
                />
            );
        case "constant":
            return (
                <TextInput
                    disabled
                    {...genericProps}
                    leftSection={
                        <DynamicIcon
                            icon={field.icon ?? "info-circle-filled"}
                            fallback={IconInfoCircleFilled}
                            size={20}
                        />
                    }
                />
            );
        case "string":
            switch (field.mode) {
                case "normal":
                    return (
                        <TextInput
                            {...genericProps}
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "edit"}
                                    fallback={IconEdit}
                                    size={20}
                                />
                            }
                        />
                    );
                case "multiline":
                    return (
                        <Textarea
                            {...genericProps}
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "edit"}
                                    fallback={IconEdit}
                                    size={20}
                                />
                            }
                            minRows={4}
                            autosize
                        />
                    );
                case "password":
                    return (
                        <PasswordInput
                            {...genericProps}
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "lock"}
                                    fallback={IconLock}
                                    size={20}
                                />
                            }
                        />
                    );
                case "suggesting":
                    return (
                        <Autocomplete
                            {...genericProps}
                            data={field.suggestions ?? []}
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "edit"}
                                    fallback={IconEdit}
                                    size={20}
                                />
                            }
                        />
                    );
            }
        case "object":
            return (
                <JsonInput
                    leftSection={
                        <DynamicIcon
                            icon={field.icon ?? "braces"}
                            fallback={IconBraces}
                            size={20}
                        />
                    }
                    {...genericProps}
                    formatOnBlur
                />
            );
        case "number":
            return (
                <NumberInput
                    min={field.min ?? undefined}
                    max={field.max ?? undefined}
                    allowDecimal={field.decimals}
                    allowNegative={field.negatives}
                    decimalScale={field.precision ?? undefined}
                    prefix={field.prefix ?? undefined}
                    suffix={field.suffix ?? undefined}
                    leftSection={
                        <DynamicIcon
                            icon={field.icon ?? "number"}
                            fallback={IconNumber}
                            size={20}
                        />
                    }
                    {...genericProps}
                />
            );
        case "selection":
            if (field.multiple) {
                return (
                    <MultiSelect
                        data={field.options ?? []}
                        leftSection={
                            <DynamicIcon
                                icon={field.icon ?? "select"}
                                fallback={IconSelect}
                                size={20}
                            />
                        }
                        {...genericProps}
                        searchable
                        clearable
                    />
                );
            } else {
                return (
                    <Select
                        data={field.options ?? []}
                        leftSection={
                            <DynamicIcon
                                icon={field.icon ?? "select"}
                                fallback={IconSelect}
                                size={20}
                            />
                        }
                        {...genericProps}
                        searchable
                        clearable
                    />
                );
            }
        case "datetime":
            switch (field.mode) {
                case "datetime":
                    return (
                        <DateTimePicker
                            value={value ? new Date(value) : null}
                            onChange={(value) =>
                                value ? value.toISOString() : null
                            }
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "calendar-filled"}
                                    fallback={IconCalendarFilled}
                                    size={20}
                                />
                            }
                            {...omit(genericProps, "value", "onChange")}
                        />
                    );
                case "time":
                    return (
                        <TimeInput
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "calendar-filled"}
                                    fallback={IconCalendarFilled}
                                    size={20}
                                />
                            }
                            {...genericProps}
                        />
                    );
                case "date":
                    return (
                        <DateInput
                            value={value ? new Date(value) : null}
                            onChange={(value) =>
                                value ? value.toISOString() : null
                            }
                            leftSection={
                                <DynamicIcon
                                    icon={field.icon ?? "clock-filled"}
                                    fallback={IconClockFilled}
                                    size={20}
                                />
                            }
                            {...omit(genericProps, "value", "onChange")}
                        />
                    );
            }
        case "resource":
            return (
                <ResourcePicker
                    field={field}
                    value={value}
                    onChange={onChange}
                />
            );
        case "duration":
            return (
                <Fieldset legend={field.label} p={"xs"}>
                    <Group gap="sm" grow>
                        {field.days && (
                            <NumberInput
                                suffix=" d"
                                placeholder="Days"
                                value={value?.days ?? 0}
                                onChange={(v) =>
                                    isNumber(v)
                                        ? onChange({
                                              ...((value as object) ?? {}),
                                              days: v,
                                          })
                                        : onChange({
                                              ...((value as object) ?? {}),
                                              days: 0,
                                          })
                                }
                            />
                        )}
                        <NumberInput
                            suffix=" hr"
                            placeholder="Hours"
                            value={value?.hours ?? 0}
                            onChange={(v) =>
                                isNumber(v)
                                    ? onChange({
                                          ...((value as object) ?? {}),
                                          hours: v,
                                      })
                                    : onChange({
                                          ...((value as object) ?? {}),
                                          hours: 0,
                                      })
                            }
                        />
                        <NumberInput
                            suffix=" min"
                            placeholder="Minutes"
                            value={value?.minutes ?? 0}
                            onChange={(v) =>
                                isNumber(v)
                                    ? onChange({
                                          ...((value as object) ?? {}),
                                          minutes: v,
                                      })
                                    : onChange({
                                          ...((value as object) ?? {}),
                                          minutes: 0,
                                      })
                            }
                        />
                        <NumberInput
                            suffix=" sec"
                            placeholder="Seconds"
                            value={value?.seconds ?? 0}
                            onChange={(v) =>
                                isNumber(v)
                                    ? onChange({
                                          ...((value as object) ?? {}),
                                          seconds: v,
                                      })
                                    : onChange({
                                          ...((value as object) ?? {}),
                                          seconds: 0,
                                      })
                            }
                        />
                    </Group>
                </Fieldset>
            );
    }
}

export function ExecutorItem({
    resource,
    executor,
}: {
    resource: Resource;
    executor: Executor;
}) {
    const form = useForm<{ [key: string]: any }>({
        initialValues: Object.keys(executor.arguments ?? {}).reduce(
            (prev, current) => ({ ...prev, [current]: undefined }),
            {},
        ),
    });
    const theme = useMantineTheme();
    const [advanced, setAdvanced] = useState(false);
    const { t } = useTranslation();
    const api = useApi(ResourceMixin);
    return (
        <Paper p="sm" className="paper-light exec-item">
            <Stack gap="sm">
                <Group gap="sm" justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        <IconPlayerPlayFilled style={{ minWidth: "24px" }} />
                        <Stack gap={0}>
                            <Text size="sm">{executor.name}</Text>
                            <Text
                                size="xs"
                                c="dimmed"
                                fs="italic"
                                lineClamp={2}
                            >
                                {executor.description}
                            </Text>
                        </Stack>
                    </Group>
                    <Switch
                        style={{ minWidth: "61px" }}
                        size="lg"
                        checked={advanced}
                        onChange={(event) => setAdvanced(event.target.checked)}
                        thumbIcon={
                            advanced ? (
                                <IconSettings
                                    size={16}
                                    color={theme.colors.primary[8]}
                                />
                            ) : (
                                <IconSettingsOff
                                    size={16}
                                    color={theme.colors.gray[6]}
                                />
                            )
                        }
                    />
                </Group>
                <Divider />
                {Object.entries(executor.arguments ?? {})
                    .filter(([_, value]) => advanced || !value.advanced)
                    .map(([fieldId, field]) => (
                        <ExecutionField
                            resource={resource}
                            executor={executor}
                            field={field}
                            value={form.values[fieldId] ?? null}
                            onChange={(value) =>
                                form.setFieldValue(fieldId, value)
                            }
                            key={fieldId}
                        />
                    ))}
                <Group gap="sm" justify="end">
                    <Button
                        leftSection={<IconX size={20} />}
                        variant="light"
                        color="red"
                        onClick={() => form.reset()}
                    >
                        {t("components.exec.item.reset")}
                    </Button>
                    <Button
                        leftSection={<IconPlayerPlayFilled size={20} />}
                        onClick={() => {
                            api.methods.execute_on_resource(
                                executor,
                                form.getValues(),
                                resource,
                            );
                            form.reset();
                        }}
                    >
                        {t("components.exec.item.exec")}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}
