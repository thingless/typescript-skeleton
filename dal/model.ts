export type Uuid = string;
export type Timestamp = string;

export interface User {
    uid: Uuid;
    is_admin: boolean;
}