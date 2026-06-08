export interface Client {
    id: string;
    name: string;
    passwordHash: string;
    isActive: boolean;
    expiresAt: string;
    maxDevices: number;
    devices: string;
    createdAt: string;
    updatedAt: string;
}
