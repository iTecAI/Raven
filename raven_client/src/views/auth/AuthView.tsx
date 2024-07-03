import { useTranslation } from "react-i18next";
import { AuthMixin, useApi } from "../../util/api";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import {
    Box,
    Button,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconFeather,
    IconLock,
    IconLogin2,
    IconUser,
    IconUserPlus,
} from "@tabler/icons-react";
import { useNotifications } from "../../util/notifications";

export function AuthView({ mode }: { mode: "login" | "create" }) {
    const { methods } = useApi(AuthMixin);
    const { t } = useTranslation();
    const nav = useNavigate();
    const { success, error } = useNotifications();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            username: (value) =>
                value.length > 0
                    ? null
                    : t("errors.form.field_required", {
                          field: t("views.auth.form.username"),
                      }),
            password: (value: string, { confirmPassword }) =>
                value.length > 0
                    ? mode === "login"
                        ? null
                        : confirmPassword === value
                        ? null
                        : t("views.auth.errors.passwordMatch")
                    : t("errors.form.field_required", {
                          field: t("views.auth.form.password"),
                      }),
            confirmPassword: (value: string, { password }) =>
                mode === "login"
                    ? null
                    : value.length > 0
                    ? value === password
                        ? null
                        : t("views.auth.errors.passwordMatch")
                    : t("errors.form.field_required", {
                          field: t("views.auth.form.passwordConfirm"),
                      }),
        },
    });
    return (
        <Box className="auth-container">
            <Stack className="auth-surface" gap="md">
                <Group className="app-logo" gap="sm" justify="space-between">
                    <IconFeather size={32} />
                    <Text size="xl">{t("common.appName")}</Text>
                </Group>
                <Paper
                    p="sm"
                    radius="sm"
                    shadow="sm"
                    className="auth-form paper-light"
                >
                    <form
                        onSubmit={form.onSubmit((values) => {
                            if (mode === "create") {
                                methods
                                    .create_user(
                                        values.username,
                                        values.password
                                    )
                                    .then((result) => {
                                        if (result) {
                                            success(
                                                t(
                                                    "views.auth.mode.create.success"
                                                )
                                            );
                                            nav("/");
                                        } else {
                                            error(
                                                t(
                                                    "views.auth.mode.create.error"
                                                )
                                            );
                                        }
                                    });
                            } else {
                                methods
                                    .login(values.username, values.password)
                                    .then((result) => {
                                        if (result) {
                                            success(
                                                t(
                                                    "views.auth.mode.login.success"
                                                )
                                            );
                                            nav("/");
                                        } else {
                                            error(
                                                t("views.auth.mode.login.error")
                                            );
                                        }
                                    });
                            }
                        })}
                    >
                        <Stack gap="sm">
                            {mode === "login" ? (
                                <Group gap="sm" justify="space-between">
                                    <IconLogin2 size={28} />
                                    <Text size="lg">
                                        {t("views.auth.mode.login.title")}
                                    </Text>
                                </Group>
                            ) : (
                                <Group gap="sm" justify="space-between">
                                    <IconUserPlus size={28} />
                                    <Text size="lg">
                                        {t("views.auth.mode.create.title")}
                                    </Text>
                                </Group>
                            )}
                            <Divider />
                            <TextInput
                                label={t("views.auth.form.username")}
                                leftSection={<IconUser size={20} />}
                                {...form.getInputProps("username")}
                            />
                            <PasswordInput
                                label={t("views.auth.form.password")}
                                leftSection={<IconLock size={20} />}
                                {...form.getInputProps("password")}
                            />
                            {mode === "create" && (
                                <PasswordInput
                                    label={t("views.auth.form.passwordConfirm")}
                                    leftSection={<IconLock size={20} />}
                                    {...form.getInputProps("confirmPassword")}
                                />
                            )}
                            {mode === "login" ? (
                                <Group gap="sm" grow>
                                    <Button
                                        variant="light"
                                        leftSection={<IconUserPlus size={20} />}
                                        justify="space-between"
                                        onClick={() => nav("/auth/create")}
                                    >
                                        {t("views.auth.mode.create.button")}
                                    </Button>
                                    <Button
                                        leftSection={<IconLogin2 size={20} />}
                                        justify="space-between"
                                        type="submit"
                                    >
                                        {t("views.auth.mode.login.button")}
                                    </Button>
                                </Group>
                            ) : (
                                <Group gap="sm" grow>
                                    <Button
                                        variant="light"
                                        leftSection={<IconLogin2 size={20} />}
                                        justify="space-between"
                                        onClick={() => nav("/auth/login")}
                                    >
                                        {t("views.auth.mode.login.button")}
                                    </Button>
                                    <Button
                                        leftSection={<IconUserPlus size={20} />}
                                        justify="space-between"
                                        type="submit"
                                    >
                                        {t("views.auth.mode.create.button")}
                                    </Button>
                                </Group>
                            )}
                        </Stack>
                    </form>
                </Paper>
            </Stack>
        </Box>
    );
}
