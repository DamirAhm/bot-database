const { isURL } = require('./utils');

const mongoose = require('mongoose');

const attachment = new mongoose.Schema({
	value: {
		type: String,
		validate: {
			validator: (str) => /^photo.+(_.+)*/.test(str),
			message: 'url must be a valid vk attachment',
		},
		required: true,
	},
	url: {
		type: String,
		validate: {
			validator: isURL,
			message: 'url must be a valid URL',
		},
		required: true,
	},
	album_id: {
		type: Number,
	},
});

const schoolSchema = new mongoose.Schema({
	classes: {
		type: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Class',
			},
		],
		default: [],
	},
	name: {
		type: String,
		valudate: {
			validator: (str) => /^.*:\d*$/.test(str),
			message: 'School name must fit format',
		},
		required: true,
		unique: true,
	},
	announcements: {
		type: [
			{
				text: String,
				attachments: [attachment],
				to: Date,
				createdBy: {
					type: Number,
					validate: {
						validator: Number.isInteger,
						message: 'Created by must be integer means vk id of user created it',
					},
				},
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					default: new mongoose.Types.ObjectId(),
				},
			},
		],
		default: [],
	},
});

schoolSchema.virtual('city', {}).get(function () {
	return this.name.split(':')[0];
});
schoolSchema.virtual('number').get(function () {
	return this.name.split(':')[1];
});

module.exports = mongoose.model('School', schoolSchema);
