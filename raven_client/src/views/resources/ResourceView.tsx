import { useScoped } from "../../util/api";

export function ResourceView() {
    const canView = useScoped(["resources.*"]);
    const canExecute = useScoped(["resources"]);

    return <></>;
}
