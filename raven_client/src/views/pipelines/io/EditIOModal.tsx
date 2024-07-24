import {
    Modal,
    Group,
    Stack,
    TextInput,
    Textarea,
    Divider,
    Button,
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSetState } from "@mantine/hooks";
import {
    IconPlus,
    IconPencil,
    IconArticle,
    IconX,
    IconCheck,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PipelineIO } from "../../../types/backend/pipeline";
import { useApi, PipelineIOMixin } from "../../../util/api";
import { useNotifications } from "../../../util/notifications";
import { EXTRAS } from "./CreateIOModal";
import { IconSelector } from "../../../components/IconSelector";
import { omit } from "lodash";

export function EditIOModal({
    editing,
    onClose,
}: {
    editing: PipelineIO | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [current, setCurrent] = useState<string | null>(null);
    const formBase = useForm<{
        name: string;
        icon: string | null;
        description: string;
    }>({
        initialValues: {
            name: "",
            icon: null,
            description: "",
        },
    });
    const [extra, setExtra] = useSetState<{ [key: string]: any }>({});
    const { success, error } = useNotifications();
    const mode = editing?.type ?? null;

    useEffect(() => {
        if (mode === null) {
            setCurrent(null);
            formBase.reset();
            setExtra((current) =>
                Object.entries(current).reduce(
                    (prev, [cur]) => ({ ...prev, [cur]: undefined }),
                    {},
                ),
            );
        }
    }, [mode]);

    useEffect(() => {
        if (editing && current !== editing?.id) {
            setCurrent(editing.id);
        }
    }, [editing?.id, current, setCurrent]);

    useEffect(() => {
        if (current && editing) {
            formBase.setValues({
                name: editing.name,
                icon: editing.icon,
                description: editing.description ?? "",
            });
            setExtra(
                omit(editing, "id", "value", "name", "icon", "description"),
            );
        }
    }, [current]);

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
                            {t("views.pipelines.io.edit_modal.title", {
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
                            leftSection={<IconCheck size={20} />}
                            disabled={
                                formBase.values.name.length === 0 ||
                                (mode === "data" &&
                                    (extra.fields ?? []).length === 0) ||
                                !current
                            }
                            onClick={() => {
                                if (!current || !editing) {
                                    return;
                                }
                                api.methods
                                    .edit_io(current, {
                                        type: editing.type,
                                        ...formBase.values,
                                        ...extra,
                                    } as any)
                                    .then((result) => {
                                        if (result) {
                                            success(
                                                t(
                                                    "views.pipelines.io.feedback.successful_edit",
                                                ),
                                            );
                                            onClose();
                                        } else {
                                            error(
                                                t(
                                                    "views.pipelines.io.feedback.error_edit",
                                                ),
                                            );
                                        }
                                    });
                            }}
                        >
                            {t("common.action.submit")}
                        </Button>
                    </Group>
                </Stack>
            )}
        </Modal>
    );
}
