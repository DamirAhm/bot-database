import { createVkApi } from './apiCreator';
import fetch from 'node-fetch';
//@ts-ignore
import FormData from 'form-data';
import fs from 'fs';

export interface getVkPhotoResponse {
	items: IVKPhoto[];
}
export interface getUploadServerUrlResponse {
	upload_url: string;
}

function isPhotoResponse(response: unknown): response is getVkPhotoResponse {
	if (typeof response === 'object' && response != undefined) {
		if ('items' in response) {
			return true;
		}
	}

	return false;
}
function isUploadServerUrlResponse(response: unknown): response is getUploadServerUrlResponse {
	if (typeof response === 'object' && response != undefined) {
		if ('upload_url' in response) {
			return true;
		}
	}

	return false;
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
enum SizeType {
	s,
	m,
	x,
	o,
	p,
	q,
	r,
	y,
	z,
	w,
}

export default class VK_API {
	apiKey: string;
	groupId: number;
	albumId: number;
	api: ReturnType<typeof createVkApi>;

	constructor(key: string, groupId: number, albumId: number) {
		this.apiKey = key;
		this.groupId = groupId;
		this.albumId = albumId;
		this.api = createVkApi(key);
	}

	async getPhotoUrl(attachment: string, album_id: number) {
		try {
			if (attachment) {
				let url;
				if (/^photo/.test(attachment)) {
					const [owner_id, photo_ids] = attachment.slice(5).split('_');
					url = await this.api('photos.get', {
						owner_id,
						photo_ids,
						album_id: album_id,
					}).then((photo: unknown) => {
						if (isPhotoResponse(photo)) {
							return photo.items[0].sizes[5].url;
						} else {
							return '';
						}
					});
				}

				return url;
			} else {
				return '';
			}
		} catch (e) {
			console.error(e);
		}
	}
	async getUser(userId: string) {
		try {
			const users = await this.api('users.get', { user_ids: userId });

			if (users && Array.isArray(users)) {
				return users[0];
			} else {
				throw new Error(
					'Bad responce from vk api (users.get)\n' + JSON.stringify(users, null, 2),
				);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async uploadPhotoToAlbum(fileReadStream: fs.ReadStream) {
		try {
			const url = await this.getUploadServerUrl('photos', {
				group_id: this.groupId,
				album_id: this.albumId,
			});

			if (url !== undefined) {
				const formData = new FormData();

				formData.append('file', fileReadStream);

				const {
					aid: album_id,
					gid: group_id,
					hash,
					server,
					photos_list,
				} = await this.uploadFileToServer(formData, url);

				const res = this.saveFile('photos', {
					album_id,
					group_id,
					hash,
					server,
					photos_list,
				});

				return res;
			} else {
				throw new Error("Can't get upload server url, try later");
			}
		} catch (e) {
			console.error(e);
		}
	}

	async uploadDoc(fileReadStream: fs.ReadStream, title: string) {
		try {
			const url = await this.getUploadServerUrl('docs', {
				group_id: this.groupId,
			});

			if (url !== undefined) {
				const formData = new FormData();

				formData.append('file', fileReadStream);

				const { file } = await this.uploadFileToServer(formData, url);

				const res = this.saveFile('docs', { file, title });

				return res;
			} else {
				throw new Error("Can't get upload server url, try later");
			}
		} catch (e) {
			console.error(e);
		}
	}

	async uploadFileToServer(formData: FormData, url: string) {
		try {
			// @ts-ignore
			const response = await fetch(url, {
				method: 'POST',
				body: formData,
			});
			let vkr = await response.json();

			if (vkr) {
				return vkr;
			} else {
				throw new Error('Empty response');
			}
		} catch (err) {
			console.error(err);
		}
	}

	async getUploadServerUrl(type: string, props: { [key: string]: string | number }) {
		try {
			return await this.api(`${type}.getUploadServer`, props).then((res: unknown) => {
				if (isUploadServerUrlResponse(res)) {
					return res.upload_url;
				}
			});
		} catch (e) {
			console.error(e);
		}
	}

	async saveFile(type: string, uploadedFileObject: { [key: string]: string | number }) {
		try {
			return await this.api(`${type}.save`, uploadedFileObject);
		} catch (e) {
			console.error(e);
		}
	}
}
