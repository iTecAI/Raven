import { Group, Text, ColorInput, Switch } from "@mantine/core";
import { IconColorSwatch } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ColorField } from "../../../../types/backend/pipeline";
import { FieldCreationProps, IOFieldRenderer } from "./types";
import { EditorWrapper } from "./util";

function ColorFieldEditor(props: FieldCreationProps<ColorField>) {
    const { t } = useTranslation();
    return (
        <EditorWrapper
            {...props}
            title={t("util.pipelines.io.field.color.title")}
            icon={<IconColorSwatch />}
        >
            <ColorInput
                label={t("util.pipelines.io.meta.default")}
                format={props.value.alpha ? "hexa" : "hex"}
                value={props.value.default_value ?? ""}
                onChange={(value) => props.setValue({ default_value: value })}
            />
            <Group gap="sm" justify="space-between" style={{ flexGrow: 1 }}>
                <Text>{t("util.pipelines.io.field.color.alpha")}</Text>
                <Switch
                    checked={props.value.alpha ?? false}
                    onClick={() =>
                        props.setValue({
                            alpha: !props.value.alpha,
                        })
                    }
                />
            </Group>
        </EditorWrapper>
    );
}

export const ColorFieldRenderer: IOFieldRenderer<ColorField> = {
    editor: ColorFieldEditor,
    render: {
        input: () => <></>,
        output: () => <></>,
    },
};
