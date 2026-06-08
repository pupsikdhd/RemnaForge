export interface Authenticator {
    id: string;
    userId: string;
    publicKey: string;
    counter: number;
    transports: string;
}
