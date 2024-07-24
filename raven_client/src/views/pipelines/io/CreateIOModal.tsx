import {
    ActionIcon,
    Box,
    Button,
    Center,
    Divider,
    Fieldset,
    Group,
    Menu,
    Modal,
    Paper,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import {
    ColorField,
    DatetimeField,
    IOFieldTypes,
    ListField,
    NumberField,
    PipelineIO,
    SelectField,
    StringField,
    SwitchField,
} from "../../../types/backend/pipeline";
import {
    IconArticle,
    IconCalendarClock,
    IconChevronDown,
    IconChevronUp,
    IconClick,
    IconColorSwatch,
    IconLetterCase,
    IconNumber,
    IconPencil,
    IconPlus,
    IconSelect,
    IconTagsFilled,
    IconToggleRightFilled,
    IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect, ReactNode, useCallback } from "react";
import { useForm } from "@mantine/form";
import { IconSelector } from "../../../components/IconSelector";
import { useDisclosure, useSetState } from "@mantine/hooks";
import { FieldRenderers } from "./fields";
import { PipelineIOMixin, useApi } from "../../../util/api";
import { useNotifications } from "../../../util/notifications";

type ExtrasProps<T = any> = {
    value: Partial<T>;
    setValue: (
        value: Partial<T> | ((current: Partial<T>) => Partial<T>),
    ) => void;
};

function AddDataFieldMenu({
    setValue,
}: ExtrasProps<{ fields: Omit<IOFieldTypes, "value">[] }>) {
    const { t } = useTranslation();
    const addItem = useCallback(
        <T extends IOFieldTypes>(
            item: Omit<T, "value" | "key" | "label" | "default_value"> & {
                default_value?: T["default_value"] | null;
            },
        ) => {
            setValue((current) => {
                return {
                    fields: [
                        ...(current.fields ?? []),
                        {
                            key: `field-${window.crypto.randomUUID().slice(0, 6)}`,
                            label: "New Field",
                            default_value: item.default_value ?? null,
                            ...item,
                        },
                    ],
                };
            });
        },
        [setValue],
    );
    return (
        <Menu position="bottom-end">
            <Menu.Target>
                <Button rightSection={<IconChevronDown size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.title",
                    )}
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconLetterCase size={20} />}
                    onClick={() =>
                        addItem<StringField>({
                            type: "string",
                            multiline: false,
                            max_length: null,
                            default_value: "",
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.string",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconNumber size={20} />}
                    onClick={() =>
                        addItem<NumberField>({
                            type: "number",
                            decimals: true,
                            negatives: true,
                            min: null,
                            max: null,
                            default_value: 0,
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.number",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconToggleRightFilled size={20} />}
                    onClick={() =>
                        addItem<SwitchField>({
                            type: "switch",
                            default_value: false,
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.switch",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconSelect size={20} />}
                    onClick={() =>
                        addItem<SelectField>({
                            type: "select",
                            options: [],
                            multiple: false,
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.select",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconTagsFilled size={20} />}
                    onClick={() =>
                        addItem<ListField>({
                            type: "list",
                            default_value: [],
                            max_length: null,
                            suggestions: [],
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.list",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconColorSwatch size={20} />}
                    onClick={() =>
                        addItem<ColorField>({
                            type: "color",
                            default_value: null,
                            alpha: false,
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.color",
                    )}
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconCalendarClock size={20} />}
                    onClick={() =>
                        addItem<DatetimeField>({
                            type: "datetime",
                            default_value: null,
                            mode: "datetime",
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.datetime",
                    )}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

function DataEntryFieldItem({
    value,
    setValue,
    index,
    field,
}: ExtrasProps<{ fields: Omit<IOFieldTypes, "value">[] }> & {
    index: number;
    field: Omit<IOFieldTypes, "value">;
}) {
    const EditorElement = FieldRenderers[field.type]?.editor;
    const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
    return (
        <Paper className="extras-item data-entry-field-item paper-light" p="sm">
            <Group gap="xs" className="field-actions">
                <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={toggleCollapsed}
                >
                    {collapsed ? <IconChevronDown /> : <IconChevronUp />}
                </ActionIcon>
                <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={() =>
                        setValue((current) => ({
                            fields: (current.fields ?? []).filter(
                                (v) => v.key !== field.key,
                            ),
                        }))
                    }
                >
                    <IconX />
                </ActionIcon>
            </Group>
            {EditorElement && (
                <EditorElement
                    collapsed={collapsed}
                    type={field.type}
                    fields={value.fields ?? []}
                    value={field}
                    setValue={(value) =>
                        setValue((current) => {
                            if (!current.fields) {
                                current.fields = [];
                            }
                            current.fields[index] = {
                                ...current.fields[index],
                                ...(value as any),
                            };
                            return { fields: [...current.fields] };
                        })
                    }
                />
            )}
        </Paper>
    );
}

function DataEntryExtras({
    value,
    setValue,
}: ExtrasProps<{ fields: Omit<IOFieldTypes, "value">[] }>) {
    const { t } = useTranslation();
    return (
        <Fieldset
            legend={t("views.pipelines.io.create_modal.extra.data.title")}
            p="xs"
            className="field-list"
        >
            {value.fields && value.fields.length > 0 ? (
                <Stack gap="sm" className="field-stack">
                    <Box className="field-items-scroll">
                        <Stack gap="sm">
                            {value.fields.map((v, i) => (
                                <DataEntryFieldItem
                                    value={value}
                                    setValue={setValue}
                                    index={i}
                                    field={v}
                                    key={i}
                                />
                            ))}
                        </Stack>
                    </Box>
                    <Group justify="end">
                        <AddDataFieldMenu value={value} setValue={setValue} />
                    </Group>
                </Stack>
            ) : (
                <Center pb="sm">
                    <AddDataFieldMenu value={value} setValue={setValue} />
                </Center>
            )}
        </Fieldset>
    );
}

function TriggerExtras({
    value,
    setValue,
}: ExtrasProps<{ label: string | null }>) {
    const { t } = useTranslation();
    return (
        <TextInput
            label={t(
                "views.pipelines.io.create_modal.extra.trigger.label_label",
            )}
            value={value.label ?? ""}
            onChange={(event) => {
                if (event.target.value.length > 0) {
                    setValue({ label: event.target.value });
                } else {
                    setValue({ label: null });
                }
            }}
            leftSection={<IconClick size="20" />}
        />
    );
}

export const EXTRAS: Partial<{
    [key in PipelineIO["type"]]: (props: ExtrasProps<any>) => ReactNode;
}> = {
    data: DataEntryExtras,
    trigger: TriggerExtras,
};

export function CreateIOModal({
    mode,
    onClose,
}: {
    mode: PipelineIO["type"] | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const formBase = useForm({
        initialValues: {
            name: "",
            icon: null,
            description: "",
        },
    });
    const [extra, setExtra] = useSetState<{ [key: string]: any }>({});
    const { success, error } = useNotifications();

    useEffect(() => {
        if (mode === null) {
            formBase.reset();
            setExtra((current) =>
                Object.entries(current).reduce(
                    (prev, [cur]) => ({ ...prev, [cur]: undefined }),
                    {},
                ),
            );
        }
    }, [mode]);
    const ExtraElement = (mode ? EXTRAS[mode] : null) ?? null;
    const api = useApi(PipelineIOMixin);

    return (
        <Modal
            opened={mode !== null}
            onClose={onClose}
            size="xl"
            title={
                mode && (
                    <Group gap="sm">
                        <IconPlus />
                        <Text size="lg">
                            {t("views.pipelines.io.create_modal.title", {
                                name: t(`views.pipelines.io.create.${mode}`),
                            })}
                        </Text>
                    </Group>
                )
            }
            className="io-create-modal"
        >
            {mode && (
                <Stack gap="sm" className="io-form-stack">
                    <Group gap="sm" wrap="nowrap">
                        <IconSelector
                            {...formBase.getInputProps("icon")}
                            label={t(
                                "views.pipelines.io.create_modal.label_icon",
                            )}
                        />
                        <TextInput
                            label={t(
                                "views.pipelines.io.create_modal.label_name",
                            )}
                            leftSection={<IconPencil size={20} />}
                            style={{ flexGrow: 1 }}
                            {...formBase.getInputProps("name")}
                        />
                    </Group>
                    <Textarea
                        {...formBase.getInputProps("description")}
                        leftSection={<IconArticle size={20} />}
                        label={t("views.pipelines.io.create_modal.desc_label")}
                    />
                    {ExtraElement && (
                        <>
                            <Divider />
                            <div className={`io-extra ${mode ?? "null"}`}>
                                <ExtraElement
                                    value={extra}
                                    setValue={setExtra}
                                />
                            </div>
                        </>
                    )}
                    <Group justify="end" gap="sm">
                        <Button
                            variant="light"
                            leftSection={<IconX size={20} />}
                            color="gray"
                            onClick={onClose}
                        >
                            {t("common.action.cancel")}
                        </Button>
                        <Button
                            leftSection={<IconPlus size={20} />}
                            disabled={
                                formBase.values.name.length === 0 ||
                                (mode === "data" &&
                                    (extra.fields ?? []).length === 0)
                            }
                            onClick={() => {
                                switch (mode) {
                                    case "data":
                                        api.methods
                                            .create_data_io({
                                                type: "data",
                                                ...formBase.values,
                                                fields: extra.fields,
                                            })
                                            .then((result) => {
                                                if (result) {
                                                    success(
                                                        t(
                                                            "views.pipelines.io.feedback.successful_creation",
                                                        ),
                                                    );
                                                    onClose();
                                                } else {
                                                    error(
                                                        t(
                                                            "views.pipelines.io.feedback.error_creation",
                                                        ),
                                                    );
                                                }
                                            });
                                        break;
                                    case "trigger":
                                        api.methods
                                            .create_trigger_io({
                                                type: "trigger",
                                                ...formBase.values,
                                                label: extra.label,
                                            })
                                            .then((result) => {
                                                if (result) {
                                                    success(
                                                        t(
                                                            "views.pipelines.io.feedback.successful_creation",
                                                        ),
                                                    );
                                                    onClose();
                                                } else {
                                                    error(
                                                        t(
                                                            "views.pipelines.io.feedback.error_creation",
                                                        ),
                                                    );
                                                }
                                            });
                                        break;
                                }
                            }}
                        >
                            {t("common.action.create")}
                        </Button>
                    </Group>
                </Stack>
            )}
        </Modal>
    );
}
