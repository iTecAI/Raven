import {
    Group,
    Stack,
    Tabs,
    TabsList,
    TabsPanel,
    TabsTab,
    Text,
} from "@mantine/core";
import { IconForms, IconLogicAnd } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PipelineIOTab } from "./io/PipelineIOTab";

export function PipelineView() {
    const { t } = useTranslation();
    const [tab, setTab] = useState<"pipelines" | "io-custom">("pipelines");

    return (
        <Tabs
            value={tab}
            onChange={(v) => setTab((v as any) ?? "pipelines")}
            className="pipeline-tabs"
        >
            <Stack gap={0} h="100%">
                <TabsList p="sm" pb={0} className="pipeline-tabs-list">
                    <TabsTab value="pipelines">
                        <Group gap="sm" wrap="nowrap">
                            <IconLogicAnd />
                            <Text>{t("views.pipelines.main.title")}</Text>
                        </Group>
                    </TabsTab>
                    <TabsTab value="io-custom">
                        <Group gap="sm" wrap="nowrap">
                            <IconForms />
                            <Text>{t("views.pipelines.io.title")}</Text>
                        </Group>
                    </TabsTab>
                </TabsList>
                <TabsPanel
                    value="pipelines"
                    p="md"
                    className="pipeline-tab editor"
                >
                    EDITOR
                </TabsPanel>
                <TabsPanel value="io-custom" p="md" className="pipeline-tab io">
                    <PipelineIOTab />
                </TabsPanel>
            </Stack>
        </Tabs>
    );
}
