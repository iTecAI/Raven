import {
    ActionIcon,
    Button,
    Center,
    Group,
    Menu,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconChevronDown,
    IconClick,
    IconCopy,
    IconDotsVertical,
    IconForms,
    IconInfoCircle,
    IconPencil,
    IconPlayerPlayFilled,
    IconTrashFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { CreateIOModal } from "./CreateIOModal";
import { useCallback, useEffect, useState } from "react";
import { PipelineIO } from "../../../types/backend/pipeline";
import { PipelineIOMixin, useApi, useScopeMatch } from "../../../util/api";
import { DynamicIcon } from "../../../components/DynamicIcon";
import { useEvent } from "../../../util/events";
import { EditIOModal } from "./EditIOModal";

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
    return (
        <Paper className="io-entry-item paper-light" p="sm">
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
                    <Menu.Item pl="xs">
                        <Group gap="sm">
                            <IconInfoCircle size={18} />
                            <Text size="sm">
                                {t("views.pipelines.io.items.menu.info")}
                            </Text>
                        </Group>
                    </Menu.Item>
                    {scopes["pipelines.io.activate"] && (
                        <Menu.Item pl="xs">
                            <Group gap="sm">
                                <IconPlayerPlayFilled size={18} />
                                <Text size="sm">
                                    {t(
                                        "views.pipelines.io.items.menu.activate",
                                    )}
                                </Text>
                            </Group>
                        </Menu.Item>
                    )}
                    {scopes["pipelines.io.manage"] && (
                        <Menu.Item pl="xs" onClick={onEdit}>
                            <Group gap="sm">
                                <IconPencil size={18} />
                                <Text size="sm">
                                    {t("views.pipelines.io.items.menu.edit")}
                                </Text>
                            </Group>
                        </Menu.Item>
                    )}
                    {scopes["pipelines.io.manage"] && (
                        <Menu.Item pl="xs">
                            <Group gap="sm">
                                <IconCopy size={18} />
                                <Text size="sm">
                                    {t("views.pipelines.io.items.menu.copy")}
                                </Text>
                            </Group>
                        </Menu.Item>
                    )}
                    {scopes["pipelines.io.manage"] && (
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
                    )}
                </Menu.Dropdown>
            </Menu>
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
