/// <reference types="node" />
import { createVkApi } from "./apiCreator";
import FormData from 'form-data';
import fs from "fs";
export interface getVkPhotoResponse {
    items: IVKPhoto[];
}
export interface getUploadServerUrlResponse {
    upload_url: string;
}
export interface IVKPhoto {
    id: number;
    alubm_id: number;
    owner_id: number;
    user_id: number;
    text: string;
    date: number;
    sizes: IVKPhotoSize[];
    width?: number;
    height?: number;
}
export interface IVKPhotoSize {
    type: SizeType;
    url: string;
    width: number;
    height: number;
}
declare enum SizeType {
    s = 0,
    m = 1,
    x = 2,
    o = 3,
    p = 4,
    q = 5,
    r = 6,
    y = 7,
    z = 8,
    w = 9
}
export default class VK_API {
    apiKey: string;
    groupId: number;
    albumId: number;
    api: ReturnType<typeof createVkApi>;
    constructor(key: string, groupId: number, albumId: number);
    getPhotoUrl(attachment: string, album_id: number): Promise<string | undefined>;
    getUser(userId: string): Promise<unknown>;
    uploadPhotoToAlbum(fileReadStream: fs.ReadStream): Promise<unknown>;
    uploadDoc(fileReadStream: fs.ReadStream, title: string): Promise<unknown>;
    uploadFileToServer(formData: FormData, url: string): Promise<any>;
    getUploadServerUrl(type: string, props: {
        [key: string]: string | number;
    }): Promise<string | undefined>;
    saveFile(type: string, uploadedFileObject: {
        [key: string]: string | number;
    }): Promise<unknown>;
}
export {};
