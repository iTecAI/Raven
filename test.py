checks = [
    "admin.users.*",
    "admin.*.manage",
    "admin.*.manage.*",
    "resources.all",
    "resources.plugin.*.view",
    "plugins.test",
]

scopes = [
    "admin.users.view",
    "admin.users.manage.create",
    "admin.groups.manage",
    "resources.all",
    "resources.plugin.test.view",
]


def glob_match(check: str, matches: list[str]) -> list[str]:
    check_parts = check.split(".")
    results = []
    for match in matches:
        parts = match.split(".")
        is_candidate = True
        for i in range(len(parts)):
            if i >= len(check_parts):
                if check_parts[-1] != "*":
                    is_candidate = False
                    break
            else:
                if check_parts[i] == parts[i] or check_parts[i] == "*":
                    pass
                else:
                    is_candidate = False
                    break

        if is_candidate:
            results.append(match)

    return results


if __name__ == "__main__":
    for check in checks:
        print(check, glob_match(check, scopes))
