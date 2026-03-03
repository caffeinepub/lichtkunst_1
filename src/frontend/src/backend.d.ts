import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Collection {
    id: string;
    coverImageId?: ExternalBlob;
    name: string;
    createdAt: bigint;
    description: string;
}
export interface NFT {
    id: string;
    title: string;
    edition: string;
    collectionId: string;
    description: string;
    mintedAt: bigint;
    imageId: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    burnNFT(id: string): Promise<void>;
    createCollection(id: string, name: string, description: string, coverImageId: ExternalBlob | null): Promise<void>;
    deleteCollection(id: string): Promise<void>;
    getAllCollections(): Promise<Array<Collection>>;
    getAllNFTs(): Promise<Array<NFT>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollectionById(id: string): Promise<Collection>;
    getNFTById(id: string): Promise<NFT>;
    getNFTsByCollection(collectionId: string): Promise<Array<NFT>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    mintNFT(id: string, title: string, description: string, imageId: ExternalBlob, collectionId: string, edition: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCollection(id: string, name: string, description: string, coverImageId: ExternalBlob | null): Promise<void>;
    updateNFT(id: string, title: string, description: string, imageId: ExternalBlob, edition: string): Promise<void>;
}
