import { useContext, useEffect } from "react";
import { Event, EventContext } from "./types";

export type { Event };

export function useEvent<TData = any>(
    path: string,
    callback: (event: Event<TData>) => void,
) {
    const { subscribe, unsubscribe } = useContext(EventContext);

    useEffect(() => {
        subscribe(path, callback);
        return () => unsubscribe(path);
    }, [path, callback]);
}
