const { createVkApi } = require('./apiCreator');
const fetch = require('node-fetch');
const config = require('../config.json');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

class VK_API {
	apiKey;
	api;
	constructor(key, groupId, albumId) {
		this.apiKey = key;
		this.groupId = groupId;
		this.albumId = albumId;
		this.api = createVkApi(key);
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
					}).then((photo) => photo.items[0].sizes[5].url);
				}

				return url;
			} else {
				return '';
			}
		} catch (e) {
			console.error(e);
		}
	}
	async getUser(userId) {
		try {
			return await this.api('users.get', { user_ids: userId });
		} catch (e) {
			console.error(e);
		}
	}

	async uploadPhotoToAlbum(fileReadStream) {
		try {
			const url = await this.getUploadServerUrl('photos', {
				group_id: config['GROUP_ID'],
				album_id: config['ALBUM_ID'],
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

	async uploadDoc(fileReadStream, title) {
		try {
			const url = await this.getUploadServerUrl('docs', {
				group_id: config['GROUP_ID'],
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

	async uploadFileToServer(formData, url) {
		try {
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

	async getUploadServerUrl(type, props) {
		try {
			return await this.api(`${type}.getUploadServer`, props).then((res) => {
				return res.upload_url;
			});
		} catch (e) {
			console.error(e);
		}
	}

	async saveFile(type, uploadedFileObject) {
		try {
			return await this.api(`${type}.save`, uploadedFileObject);
		} catch (e) {
			console.error(e);
		}
	}
}

module.exports = VK_API;
