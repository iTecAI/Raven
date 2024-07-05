export type Scope = {
    id: string;
    parent: string | null;
    display_name: string | null;
    path: string;
    children: ScopeRecords;
};

export type ScopeRecords = { [key: string]: Scope };
