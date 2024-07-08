export type Session = {
    id: string;
    last_request: string;
    user_id: string | null;
};

export type User = {
    id: string;
    username: string;
    admin: boolean;
    scopes: string[];
};

export type AuthState = {
    session: Session;
    user: User | null;
};
