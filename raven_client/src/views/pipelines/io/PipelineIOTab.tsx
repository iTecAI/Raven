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
    IconForms,
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

function IOEntryItem({
    entry,
    scopes,
}: {
    entry: PipelineIO;
    scopes: {
        "pipelines.io.view": boolean | null;
        "pipelines.io.manage": boolean | null;
        "pipelines.io.activate": boolean | null;
    };
}) {
    const { t } = useTranslation();
    return (
        <Paper className="io-entry-item paper-light" p="sm">
            {(scopes["pipelines.io.manage"] ||
                scopes["pipelines.io.activate"]) && (
                <Group className="entry-actions" gap="xs" wrap="nowrap">
                    {scopes["pipelines.io.activate"] && (
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            color="gray"
                        >
                            <IconPlayerPlayFilled />
                        </ActionIcon>
                    )}
                    {scopes["pipelines.io.manage"] && (
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            color="gray"
                        >
                            <IconCopy />
                        </ActionIcon>
                    )}
                    {scopes["pipelines.io.manage"] && (
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            color="gray"
                        >
                            <IconTrashFilled />
                        </ActionIcon>
                    )}
                </Group>
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
            </Stack>
        </Paper>
    );
}

export function PipelineIOTab() {
    const { t } = useTranslation();
    const [creationMode, setCreationMode] = useState<PipelineIO["type"] | null>(
        null,
    );

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
        </Stack>
    );
}
