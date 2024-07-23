import {
    ActionIcon,
    Center,
    Group,
    Modal,
    Pagination,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    TextInputProps,
    Tooltip,
} from "@mantine/core";
import { DynamicIcon } from "./DynamicIcon";
import { useDisclosure, useInputState, useUncontrolled } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { IconBackground, IconSearch, IconX } from "@tabler/icons-react";
import { iconsList } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { camelCase, upperFirst } from "lodash";

const PAGESIZE = 128;

function IconSelectorModal({
    value,
    onChange,
    open,
    onClose,
}: {
    value: string | null;
    onChange: (value: string | null) => void;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useInputState("");
    const [page, setPage] = useState(1);
    const filteredIcons = useMemo(() => {
        if (search.length === 0) {
            return iconsList.default;
        } else {
            return iconsList.default.filter((v) => {
                const norm = v.replace(/-/g, " ");
                return (
                    search.toLowerCase().includes(norm.toLowerCase()) ||
                    norm.toLowerCase().includes(search.toLowerCase())
                );
            });
        }
    }, [search]);

    return (
        <Modal
            opened={open}
            onClose={onClose}
            title={t("components.icon_select.title")}
            size="lg"
            className="icon-selector-modal"
        >
            <Stack gap="sm" className="selector-stack">
                <TextInput
                    leftSection={<IconSearch size={20} />}
                    value={search}
                    onChange={setSearch}
                />
                {value !== null && (
                    <Paper className="paper-light value-box" p="sm" shadow="sm">
                        <Group gap="sm" justify="space-between">
                            <Group gap="sm">
                                <DynamicIcon icon={value} size="28" />
                                <Stack gap={0}>
                                    <Text size="sm">
                                        {"Icon" + upperFirst(camelCase(value))}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {value}
                                    </Text>
                                </Stack>
                            </Group>
                            <ActionIcon
                                variant="transparent"
                                onClick={() => onChange(null)}
                            >
                                <IconX />
                            </ActionIcon>
                        </Group>
                    </Paper>
                )}
                <Paper withBorder p="sm" className="selector-results">
                    <ScrollArea className="selector-scroll">
                        <SimpleGrid
                            cols={{ base: 3, sm: 5, md: 6, lg: 8, xl: 10 }}
                            spacing="xs"
                            verticalSpacing="xs"
                        >
                            {filteredIcons
                                .slice((page - 1) * PAGESIZE, page * PAGESIZE)
                                .map((key) => (
                                    <Tooltip label={key} key={key}>
                                        <Paper
                                            p="xs"
                                            className={
                                                "icon-item paper-light" +
                                                (key === value ? " active" : "")
                                            }
                                            onClick={() =>
                                                key === value
                                                    ? onChange(null)
                                                    : onChange(key)
                                            }
                                        >
                                            <Center>
                                                <DynamicIcon icon={key} />
                                            </Center>
                                        </Paper>
                                    </Tooltip>
                                ))}
                        </SimpleGrid>
                    </ScrollArea>
                </Paper>
                <Group justify="end">
                    <Pagination
                        value={page}
                        onChange={setPage}
                        total={Math.ceil(filteredIcons.length / PAGESIZE)}
                    />
                </Group>
            </Stack>
        </Modal>
    );
}

export function IconSelector({
    value,
    onChange,
    ...props
}: {
    value?: string | null;
    onChange?: (value: string | null) => void;
} & Partial<
    Omit<
        TextInputProps,
        | "value"
        | "onChange"
        | "readonly"
        | "leftSection"
        | "rightSection"
        | "onClick"
        | "placeholder"
    >
>) {
    const [_value, handleChange] = useUncontrolled({
        value,
        defaultValue: props.defaultValue as string | null,
        finalValue: null,
        onChange,
    });
    const { t } = useTranslation();
    const [active, { open, close }] = useDisclosure(false);
    return (
        <>
            <TextInput
                readOnly
                value={_value ?? ""}
                leftSection={
                    _value ? (
                        <DynamicIcon icon={_value} size={20} />
                    ) : (
                        <IconBackground size={20} />
                    )
                }
                rightSection={
                    _value ? (
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            onClick={() => handleChange(null)}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                    ) : undefined
                }
                {...props}
                className="icon-selector"
                onClick={() => open()}
                placeholder={t("components.icon_select.placeholder")}
            />
            <IconSelectorModal
                value={_value}
                onChange={handleChange}
                open={active}
                onClose={close}
            />
        </>
    );
}
