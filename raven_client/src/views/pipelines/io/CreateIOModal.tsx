import { Group, Modal, Text } from "@mantine/core";
import { PipelineIO } from "../../../types/backend/pipeline";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm } from "@mantine/form";

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
        ></Modal>
    );
}
