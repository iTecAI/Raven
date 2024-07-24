import { Stack, Group, Text, Switch } from "@mantine/core";
import { IconToggleRightFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { SwitchField } from "../../../../types/backend/pipeline";
import { FieldCreationProps, IOFieldRenderer } from "./types";
import { MetaFields } from "./util";

function SwitchFieldEditor(props: FieldCreationProps<SwitchField>) {
    const { t } = useTranslation();
    return (
        <Stack gap="xs">
            <Group gap="sm">
                <IconToggleRightFilled />
                <Text>{t("util.pipelines.io.field.switch.title")}</Text>
            </Group>
            <MetaFields
                value={props.value}
                setValue={props.setValue}
                fields={props.fields}
            />
            <Group gap="sm" justify="space-between" style={{ flexGrow: 1 }}>
                <Text>{t("util.pipelines.io.meta.default")}</Text>
                <Switch
                    checked={props.value.default_value ?? false}
                    onClick={() =>
                        props.setValue({
                            default_value: !props.value.default_value,
                        })
                    }
                />
            </Group>
        </Stack>
    );
}

export const SwitchFieldRenderer: IOFieldRenderer<SwitchField> = {
    editor: SwitchFieldEditor,
    render: {
        input: () => <></>,
        output: () => <></>,
    },
};
