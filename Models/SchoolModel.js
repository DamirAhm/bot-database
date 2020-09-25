// @ts-nocheck
const mongoose = require('mongoose');

const schoolSchema = mongoose.Schema({
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

module.exports = mongoose.model('Class', schoolSchema);
