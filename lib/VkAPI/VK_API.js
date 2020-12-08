"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const apiCreator_1 = require("./apiCreator");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
//@ts-ignore
const form_data_1 = tslib_1.__importDefault(require("form-data"));
function isPhotoResponse(response) {
    if (typeof response === "object" && response != undefined) {
        if ("items" in response) {
            return true;
        }
    }
    return false;
}
function isUploadServerUrlResponse(response) {
    if (typeof response === "object" && response != undefined) {
        if ("upload_url" in response) {
            return true;
        }
    }
    return false;
}
var SizeType;
(function (SizeType) {
    SizeType[SizeType["s"] = 0] = "s";
    SizeType[SizeType["m"] = 1] = "m";
    SizeType[SizeType["x"] = 2] = "x";
    SizeType[SizeType["o"] = 3] = "o";
    SizeType[SizeType["p"] = 4] = "p";
    SizeType[SizeType["q"] = 5] = "q";
    SizeType[SizeType["r"] = 6] = "r";
    SizeType[SizeType["y"] = 7] = "y";
    SizeType[SizeType["z"] = 8] = "z";
    SizeType[SizeType["w"] = 9] = "w";
})(SizeType || (SizeType = {}));
class VK_API {
    constructor(key, groupId, albumId) {
        this.apiKey = key;
        this.groupId = groupId;
        this.albumId = albumId;
        this.api = apiCreator_1.createVkApi(key);
    }
    async getPhotoUrl(attachment, album_id) {
        try {
            if (attachment) {
                let url;
                if (/^photo/.test(attachment)) {
                    const [owner_id, photo_ids] = attachment.slice(5).split('_');
                    url = await this.api('photos.get', {
                        owner_id,
                        photo_ids,
                        album_id: album_id,
                    }).then((photo) => {
                        if (isPhotoResponse(photo)) {
                            return photo.items[0].sizes[5].url;
                        }
                        else {
                            return "";
                        }
                    });
                }
                return url;
            }
            else {
                return '';
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    async getUser(userId) {
        try {
            return await this.api('users.get', { user_ids: userId });
        }
        catch (e) {
            console.error(e);
        }
    }
    async uploadPhotoToAlbum(fileReadStream) {
        try {
            const url = await this.getUploadServerUrl('photos', {
                group_id: this.groupId,
                album_id: this.albumId,
            });
            if (url !== undefined) {
                const formData = new form_data_1.default();
                formData.append('file', fileReadStream);
                const { aid: album_id, gid: group_id, hash, server, photos_list, } = await this.uploadFileToServer(formData, url);
                const res = this.saveFile('photos', {
                    album_id,
                    group_id,
                    hash,
                    server,
                    photos_list,
                });
                return res;
            }
            else {
                throw new Error("Can't get upload server url, try later");
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    async uploadDoc(fileReadStream, title) {
        try {
            const url = await this.getUploadServerUrl('docs', {
                group_id: this.groupId,
            });
            if (url !== undefined) {
                const formData = new form_data_1.default();
                formData.append('file', fileReadStream);
                const { file } = await this.uploadFileToServer(formData, url);
                const res = this.saveFile('docs', { file, title });
                return res;
            }
            else {
                throw new Error("Can't get upload server url, try later");
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    async uploadFileToServer(formData, url) {
        try {
            // @ts-ignore
            const response = await node_fetch_1.default(url, {
                method: 'POST',
                body: formData,
            });
            let vkr = await response.json();
            if (vkr) {
                return vkr;
            }
            else {
                throw new Error('Empty response');
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    async getUploadServerUrl(type, props) {
        try {
            return await this.api(`${type}.getUploadServer`, props).then((res) => {
                if (isUploadServerUrlResponse(res)) {
                    return res.upload_url;
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async saveFile(type, uploadedFileObject) {
        try {
            return await this.api(`${type}.save`, uploadedFileObject);
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.default = VK_API;
//# sourceMappingURL=VK_API.js.map