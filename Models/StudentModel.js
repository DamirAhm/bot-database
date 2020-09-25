// @ts-nocheck
const mongoose = require('mongoose');
const { Roles, checkValidTime } = require('./utils');

const studentSchema = mongoose.Schema({
	class: {
		type: mongoose.Schema.ObjectId,
		ref: 'Class',
	},
	role: {
		type: String,
		default: Roles.student,
		enum: Object.values(Roles),
		required: true,
	},
	vkId: {
		type: Number,
		required: true,
		unique: true,
		validate: {
			validator: Number.isInteger,
			message: 'VkId must be integer',
		},
	},
	settings: {
		notificationsEnabled: {
			type: Boolean,
			default: true,
		},
		notificationTime: {
			type: String,
			default: '17:00',
			validate: {
				validator: checkValidTime,
				message: 'Notification time should match template like 00:00',
			},
		},
		daysForNotification: {
			type: [Number],
			default: [1],
			validate: {
				validator: (array) =>
					array.every((number) => Number.isInteger(number) && number >= 0) &&
					array.length > 0,
				message: "Day index must be an integer and mustn't be empty",
			},
		},
	},
	lastHomeworkCheck: {
		type: Date,
		default: new Date(0),
		validate: {
			validator: (date) => Date.now() - date >= 0,
			message: 'Last check of homework time can`t be in the future',
		},
	},
	firstName: String,
	secondName: String,
	fullName: String,
	registered: {
		type: Boolean,
		default: false,
	},
	schoolName: {
		type: string,
		ref: 'Student',
		required: true,
	},
});

module.exports = mongoose.model('Student', studentSchema);
