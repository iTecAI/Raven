import {
    Button,
    Group,
    Menu,
    Paper,
    ScrollArea,
    Skeleton,
    Stack,
    TextInput,
} from "@mantine/core";
import { IconChevronDown, IconClick, IconForms } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { CreateIOModal } from "./CreateIOModal";
import { useState } from "react";
import { PipelineIO } from "../../../types/backend/pipeline";

export function PipelineIOTab() {
    const { t } = useTranslation();
    const [creationMode, setCreationMode] = useState<PipelineIO["type"] | null>(
        null,
    );
    return (
        <Stack gap="sm" className="io-stack">
            <TextInput style={{ flexGrow: 1 }} />
            <Paper withBorder p="sm" className="io-list">
                <ScrollArea className="io-scroll">
                    <Stack gap="sm">
                        {new Array(50).fill(1).map((_, i) => (
                            <Skeleton animate={false} key={i} h={32} />
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
