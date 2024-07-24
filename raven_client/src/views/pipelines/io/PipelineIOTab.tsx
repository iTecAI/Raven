import {
    Accordion,
    ActionIcon,
    Button,
    Center,
    Group,
    Menu,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconChevronDown,
    IconClick,
    IconCopy,
    IconDeviceFloppy,
    IconDotsVertical,
    IconForms,
    IconPencil,
    IconSettings,
    IconTrashFilled,
    IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { CreateIOModal } from "./CreateIOModal";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
    PipelineDataIO,
    PipelineIO,
    PipelineTriggerIO,
} from "../../../types/backend/pipeline";
import { PipelineIOMixin, useApi, useScopeMatch } from "../../../util/api";
import { DynamicIcon } from "../../../components/DynamicIcon";
import { useEvent } from "../../../util/events";
import { EditIOModal } from "./EditIOModal";
import { useSetState } from "@mantine/hooks";
import { FieldRenderers } from "./fields";
import { isEqual } from "lodash";

function TriggerEntryState({
    entry,
    scopes,
}: {
    entry: PipelineTriggerIO;
    scopes: {
        "pipelines.io.view": boolean | null;
        "pipelines.io.manage": boolean | null;
        "pipelines.io.activate": boolean | null;
    };
}) {
    const { t } = useTranslation();
    const { methods } = useApi(PipelineIOMixin);
    return (
        <Group gap="sm" justify="space-between">
            <Text>{t("views.pipelines.io.items.trigger.activate")}</Text>
            <Button
                leftSection={
                    <DynamicIcon icon={entry.icon ?? "player-play-filled"} />
                }
                disabled={!scopes["pipelines.io.activate"]}
                onClick={() => methods.activate_io(entry.id, {})}
            >
                {entry.label ?? entry.name}
            </Button>
        </Group>
    );
}

function DataEntryState({
    entry,
    scopes,
}: {
    entry: PipelineDataIO;
    scopes: {
        "pipelines.io.view": boolean | null;
        "pipelines.io.manage": boolean | null;
        "pipelines.io.activate": boolean | null;
    };
}) {
    const { methods } = useApi(PipelineIOMixin);
    const { t } = useTranslation();
    const [fieldValues, setFieldValues] = useSetState<{ [key: string]: any }>(
        entry.fields.reduce(
            (prev, cur) => ({ ...prev, [cur.key]: cur.value }),
            {},
        ),
    );
    const savedValues = useMemo(
        () =>
            entry.fields.reduce(
                (prev, cur) => ({ ...prev, [cur.key]: cur.value }),
                {},
            ),
        [entry.fields],
    );

    useEffect(() => {
        if (!isEqual(fieldValues, savedValues)) {
            setFieldValues(savedValues);
        }
    }, [entry.fields]);

    return (
        <Stack gap="sm">
            <SimpleGrid
                spacing="sm"
                verticalSpacing="sm"
                cols={{
                    base: 1,
                    md: Math.min(2, entry.fields.length),
                    lg: Math.min(3, entry.fields.length),
                }}
            >
                {entry.fields.map((field) => {
                    if (scopes["pipelines.io.activate"]) {
                        const Field = FieldRenderers[field.type].render.input;
                        return (
                            <Field
                                key={field.key}
                                field={field}
                                value={fieldValues[field.key]}
                                onChange={(value) =>
                                    setFieldValues({ [field.key]: value })
                                }
                            />
                        );
                    } else {
                        const Field = FieldRenderers[field.type].render.output;
                        return <Field key={field.key} field={field} />;
                    }
                })}
            </SimpleGrid>
            {scopes["pipelines.io.activate"] && (
                <Group gap="sm" justify="end">
                    <Button
                        justify="space-between"
                        leftSection={<IconX size={20} />}
                        variant="light"
                        color="gray"
                        disabled={isEqual(savedValues, fieldValues)}
                        onClick={() =>
                            setFieldValues(
                                entry.fields.reduce(
                                    (prev, cur) => ({
                                        ...prev,
                                        [cur.key]: cur.value,
                                    }),
                                    {},
                                ),
                            )
                        }
                    >
                        {t("common.action.cancel")}
                    </Button>
                    <Button
                        justify="space-between"
                        leftSection={<IconDeviceFloppy size={20} />}
                        disabled={isEqual(savedValues, fieldValues)}
                        onClick={() =>
                            methods.activate_io(entry.id, fieldValues)
                        }
                    >
                        {t("common.action.save")}
                    </Button>
                </Group>
            )}
        </Stack>
    );
}

function IOEntryItem({
    entry,
    scopes,
    onEdit,
}: {
    entry: PipelineIO;
    scopes: {
        "pipelines.io.view": boolean | null;
        "pipelines.io.manage": boolean | null;
        "pipelines.io.activate": boolean | null;
    };
    onEdit: () => void;
}) {
    const { t } = useTranslation();
    const { methods } = useApi(PipelineIOMixin);

    const StateElement: (props: {
        entry: PipelineIO;
        scopes: object;
    }) => ReactNode = useMemo(() => {
        switch (entry.type) {
            case "trigger":
                return TriggerEntryState;
            case "data":
                return DataEntryState;
        }
    }, [entry.id, entry.type]) as any;

    return (
        <Paper className="io-entry-item paper-light" p="sm">
            {scopes["pipelines.io.manage"] && (
                <Menu position="bottom-end" withArrow>
                    <Menu.Target>
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            color="gray"
                            className="entry-actions"
                        >
                            <IconDotsVertical />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item pl="xs" onClick={onEdit}>
                            <Group gap="sm">
                                <IconPencil size={18} />
                                <Text size="sm">
                                    {t("views.pipelines.io.items.menu.edit")}
                                </Text>
                            </Group>
                        </Menu.Item>
                        <Menu.Item
                            pl="xs"
                            onClick={() => methods.duplicate_io(entry.id)}
                        >
                            <Group gap="sm">
                                <IconCopy size={18} />
                                <Text size="sm">
                                    {t("views.pipelines.io.items.menu.copy")}
                                </Text>
                            </Group>
                        </Menu.Item>
                        <Menu.Item
                            pl="xs"
                            onClick={() => methods.delete_io(entry.id)}
                        >
                            <Group gap="sm">
                                <IconTrashFilled size={18} />
                                <Text size="sm">
                                    {t("views.pipelines.io.items.menu.delete")}
                                </Text>
                            </Group>
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )}
            <Stack gap="sm">
                <Group gap="sm" className="entry-title" wrap="nowrap">
                    <DynamicIcon
                        icon={entry.icon ?? "settings-2"}
                        style={{ minWidth: "24px" }}
                    />
                    <Stack gap={0}>
                        <Text lineClamp={1}>{entry.name}</Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                            {t(`views.pipelines.io.create.${entry.type}`)}
                        </Text>
                    </Stack>
                </Group>
                <Paper withBorder p="sm">
                    {entry.description && entry.description.length > 0 ? (
                        <Text>{entry.description}</Text>
                    ) : (
                        <Center>
                            <Text c="dimmed">
                                {t("views.pipelines.io.items.no_description")}
                            </Text>
                        </Center>
                    )}
                </Paper>
                <Accordion variant="separated">
                    <Accordion.Item value="state">
                        <Accordion.Control icon={<IconSettings />}>
                            {t("views.pipelines.io.items.state")}
                        </Accordion.Control>
                        <Accordion.Panel>
                            <StateElement
                                entry={entry as any}
                                scopes={scopes}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Stack>
        </Paper>
    );
}

export function PipelineIOTab() {
    const { t } = useTranslation();
    const [creationMode, setCreationMode] = useState<PipelineIO["type"] | null>(
        null,
    );
    const [editing, setEditing] = useState<PipelineIO | null>(null);

    const [entries, setEntries] = useState<PipelineIO[]>([]);
    const api = useApi(PipelineIOMixin);
    const scopes = useScopeMatch(
        "pipelines.io.view",
        "pipelines.io.manage",
        "pipelines.io.activate",
    );

    const getEntries = useCallback(() => {
        if (api.state === "ready" && api.auth?.user?.id) {
            api.methods.all_io().then(setEntries);
        }
    }, [api.state, api.auth?.user?.id]);

    useEffect(getEntries, [getEntries]);
    useEvent("pipeline.io.edit", getEntries);
    useEvent("pipeline.io.activate", getEntries);

    return (
        <Stack gap="sm" className="io-stack">
            <TextInput style={{ flexGrow: 1 }} />
            <Paper withBorder p="sm" className="io-list">
                <ScrollArea className="io-scroll">
                    <Stack gap="sm">
                        {entries.map((v) => (
                            <IOEntryItem
                                entry={v}
                                key={v.id}
                                scopes={scopes as any}
                                onEdit={() => setEditing(v)}
                            />
                        ))}
                    </Stack>
                </ScrollArea>
            </Paper>
            <Group justify="end">
                <Menu position="top-end">
                    <Menu.Target>
                        <Button rightSection={<IconChevronDown size={20} />}>
                            {t("views.pipelines.io.create.button")}
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconForms size={20} />}
                            onClick={() => setCreationMode("data")}
                        >
                            {t("views.pipelines.io.create.data")}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconClick size={20} />}
                            onClick={() => setCreationMode("trigger")}
                        >
                            {t("views.pipelines.io.create.trigger")}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <CreateIOModal
                mode={creationMode}
                onClose={() => setCreationMode(null)}
            />
            <EditIOModal editing={editing} onClose={() => setEditing(null)} />
        </Stack>
    );
}
