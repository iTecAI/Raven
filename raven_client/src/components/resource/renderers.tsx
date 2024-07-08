import { isString } from "lodash";
import {
    ResourceProperty,
    ResourcePropertyType,
} from "../../types/backend/resource";
import { CodeHighlight } from "@mantine/code-highlight";
import {
    Badge,
    Code,
    ColorSwatch,
    Fieldset,
    Group,
    Indicator,
    NumberFormatter,
    Paper,
    Pill,
    Switch,
    Text,
} from "@mantine/core";
import { Calendar, DateTimePicker, TimeInput } from "@mantine/dates";
import { useTranslation } from "react-i18next";

export function ResourcePropertyRenderer({
    property,
}: {
    property: ResourceProperty;
}) {
    const { t } = useTranslation();
    if (property.value === null) {
        return (
            <Text c="dimmed" fs="italic" size="sm">
                {t("components.resources.render.no_content")}
            </Text>
        );
    }
    switch (property.type) {
        case ResourcePropertyType.OBJECT:
            return (
                <CodeHighlight
                    code={
                        isString(property.value)
                            ? property.value
                            : JSON.stringify(property.value, undefined, 4)
                    }
                    language="json"
                />
            );
        case ResourcePropertyType.TEXT:
            return (
                <Code block>
                    {property.prefix && property.prefix + " "}
                    {property.value}
                    {property.suffix && " " + property.suffix}
                </Code>
            );
        case ResourcePropertyType.NUMBER:
            return (
                <Code block>
                    <NumberFormatter
                        prefix={property.prefix ?? undefined}
                        suffix={property.suffix ?? undefined}
                        thousandSeparator
                        value={property.value}
                    />
                </Code>
            );
        case ResourcePropertyType.BOOLEAN:
            return <Switch readOnly checked={property.value} />;
        case ResourcePropertyType.DATE:
            return (
                <Calendar
                    date={new Date(property.value)}
                    static
                    renderDay={(date) => {
                        const day = date.getDate();
                        return (
                            <Indicator
                                size={6}
                                color="red"
                                offset={-2}
                                disabled={
                                    day !== new Date(property.value).getDate()
                                }
                            >
                                <div>{day}</div>
                            </Indicator>
                        );
                    }}
                />
            );
        case ResourcePropertyType.TIME:
            return (
                <TimeInput value={property.value} readOnly variant="filled" />
            );
        case ResourcePropertyType.DATETIME:
            return (
                <DateTimePicker
                    value={new Date(property.value)}
                    readOnly
                    variant="filled"
                />
            );
        case ResourcePropertyType.COLOR:
            return <ColorSwatch color={property.value} />;
        case ResourcePropertyType.OPTION:
            return <Badge>{property.value}</Badge>;
        case ResourcePropertyType.LIST:
            return (
                <Paper p="xs">
                    <Group gap="xs">
                        {property.value.map((v: any, i: number) => (
                            <Badge variant="dot" key={i}>
                                {v}
                            </Badge>
                        ))}
                    </Group>
                </Paper>
            );
    }
}
