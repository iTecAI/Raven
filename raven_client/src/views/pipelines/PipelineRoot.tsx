import { Group, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@mantine/core";
import { IconForms, IconLogicAnd } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function PipelineView() {
    const { t } = useTranslation();
    const [tab, setTab] = useState<"pipelines" | "io-custom">("pipelines");

    return (
        <Tabs value={tab} onChange={(v) => setTab((v as any) ?? "pipelines")}>
            <TabsList p="sm" pb={0}>
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
            <TabsPanel value="pipelines" p="md">
                EDITOR
            </TabsPanel>
            <TabsPanel value="io-custom" p="md">
                I/O
            </TabsPanel>
        </Tabs>
    );
}
