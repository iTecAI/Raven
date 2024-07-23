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
    IOFieldTypes,
    PipelineIO,
    StringField,
} from "../../../types/backend/pipeline";
import {
    IconArticle,
    IconCalendarClock,
    IconChevronDown,
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
import { useSetState } from "@mantine/hooks";
import { FieldRenderers } from "./fields";
import { uniqueId } from "lodash";

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
            item: Omit<T, "value" | "key" | "label" | "default_value">,
        ) => {
            setValue((current) => {
                return {
                    fields: [
                        ...(current.fields ?? []),
                        {
                            key: `field-${uniqueId()}`,
                            label: "New Field",
                            default_value: null,
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
                        })
                    }
                >
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.string",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconNumber size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.number",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconToggleRightFilled size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.switch",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconSelect size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.select",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconTagsFilled size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.list",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconColorSwatch size={20} />}>
                    {t(
                        "views.pipelines.io.create_modal.extra.data.add_field.item.color",
                    )}
                </Menu.Item>
                <Menu.Item leftSection={<IconCalendarClock size={20} />}>
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
    return (
        <Paper className="extras-item data-entry-field-item paper-light" p="sm">
            <ActionIcon
                variant="transparent"
                className="remove-item"
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
            {EditorElement && (
                <EditorElement
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
    console.log(value);
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

const EXTRAS: Partial<{
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

    return (
        <Modal
            opened={mode !== null}
            onClose={onClose}
            size="xl"
            title={
                <Group gap="sm">
                    <IconPlus />
                    <Text size="lg">
                        {t("views.pipelines.io.create_modal.title", {
                            name: t(`views.pipelines.io.create.${mode}`),
                        })}
                    </Text>
                </Group>
            }
            className="io-create-modal"
        >
            <Stack gap="sm" className="io-form-stack">
                <Group gap="sm" wrap="nowrap">
                    <IconSelector
                        {...formBase.getInputProps("icon")}
                        label={t("views.pipelines.io.create_modal.label_icon")}
                    />
                    <TextInput
                        label={t("views.pipelines.io.create_modal.label_name")}
                        leftSection={<IconPencil size={20} />}
                        style={{ flexGrow: 1 }}
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
                            <ExtraElement value={extra} setValue={setExtra} />
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
                    <Button leftSection={<IconPlus size={20} />}>
                        {t("common.action.create")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
