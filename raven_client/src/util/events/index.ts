import { useContext, useEffect } from "react";
import { Event, EventContext } from "./types";

export type { Event };

export function useEvent<TData = any>(
    path: string,
    callback: (event: Event<TData>) => void,
) {
    const { subscribe, unsubscribe } = useContext(EventContext);

    useEffect(() => {
        const subid = subscribe(path, callback);
        return () => unsubscribe({ channel: path, id: subid });
    }, [path, callback]);
}
