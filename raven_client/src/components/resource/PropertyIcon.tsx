import { IconProps } from "@tabler/icons-react";
import { ResourcePropertyType } from "../../types/backend/resource";
import { DynamicIcon } from "../DynamicIcon";

export function getPropertyIcon(propertyType: ResourcePropertyType): string {
    switch (propertyType) {
        case ResourcePropertyType.OBJECT:
            return "braces";
        case ResourcePropertyType.TEXT:
            return "letter-case";
        case ResourcePropertyType.NUMBER:
            return "number";
        case ResourcePropertyType.BOOLEAN:
            return "switch";
        case ResourcePropertyType.DATE:
            return "calendar";
        case ResourcePropertyType.TIME:
            return "clock";
        case ResourcePropertyType.DATETIME:
            return "calendar-time";
        case ResourcePropertyType.COLOR:
            return "color-picker";
        case ResourcePropertyType.OPTION:
            return "select";
        case ResourcePropertyType.LIST:
            return "list";
    }
}

export function ResourcePropertyIcon({
    type,
    ...props
}: { type: ResourcePropertyType } & Partial<IconProps>) {
    return <DynamicIcon icon={getPropertyIcon(type)} {...props} />;
}
