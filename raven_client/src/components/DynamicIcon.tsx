import * as Icons from "@tabler/icons-react";
import { camelCase, upperFirst } from "lodash";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

export function DynamicIcon({
    icon,
    fallback,
    ...props
}: { icon: string; fallback?: (props: any) => ReactNode } & Partial<
    Omit<Icons.IconProps, "name">
>) {
    const _fallback = fallback ?? Icons.IconQuestionMark;
    const _target = Icons[
        ("Icon" + upperFirst(camelCase(icon))) as keyof typeof Icons
    ] as ForwardRefExoticComponent<Icons.IconProps & RefAttributes<Icons.Icon>>;
    const IconElement = _target ?? _fallback;
    return <IconElement {...props} />;
}
