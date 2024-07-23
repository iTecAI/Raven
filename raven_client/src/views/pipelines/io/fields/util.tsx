import { ActionIcon, Group, TextInput } from "@mantine/core";
import { IconCheck, IconKey, IconTagFilled } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IOFieldTypes } from "../../../../types/backend/pipeline";

export function MetaFields({
    value,
    setValue,
    fields,
}: {
    value: any;
    setValue: (value: any) => void;
    fields: Omit<IOFieldTypes, "value">[];
}) {
    const { t } = useTranslation();
    const [key, setKey] = useState(value.key ?? "");
    return (
        <Group gap="sm" wrap="nowrap">
            <TextInput
                value={key}
                onChange={(event) =>
                    setKey(
                        event.target.value
                            .toLowerCase()
                            .replace(/\s|_/g, "-")
                            .replace(/[^A-Za-z0-9_-]/g, ""),
                    )
                }
                label={t("util.pipelines.io.meta.key")}
                leftSection={<IconKey size={20} />}
                rightSection={
                    <ActionIcon
                        size="sm"
                        variant="light"
                        disabled={
                            key === value.key ||
                            fields.map((v) => v.key).includes(key)
                        }
                        onClick={() => setValue({ key })}
                    >
                        <IconCheck size={18} />
                    </ActionIcon>
                }
            />
            <TextInput
                value={value.label ?? ""}
                onChange={(event) => setValue({ label: event.target.value })}
                label={t("util.pipelines.io.meta.label")}
                leftSection={<IconTagFilled size={20} />}
                style={{ flexGrow: 1 }}
            />
        </Group>
    );
}
