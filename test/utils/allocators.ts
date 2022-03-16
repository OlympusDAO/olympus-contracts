export enum AllocatorStatus {
    OFFLINE = 0,
    ACTIVATED = 1,
    MIGRAING = 2,
}

export interface AllocatorInitData {
    authority: string;
    extender: string;
    tokens: string[];
}
