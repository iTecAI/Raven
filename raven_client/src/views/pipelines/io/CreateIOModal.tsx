import { Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { PipelineIO } from "../../../types/backend/pipeline";
import { IconArticle, IconPencil, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { IconSelector } from "../../../components/IconSelector";

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

    useEffect(() => formBase.reset(), [mode]);

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
        >
            <Stack gap="sm">
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
            </Stack>
        </Modal>
    );
}
