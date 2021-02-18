import { IClass, ClassDocument } from '../types';
import mongoose from 'mongoose';
import { checkValidTime, isLesson, isURL, isValidClassName } from './utils';

const attachment = new mongoose.Schema({
	value: {
		type: String,
		validate: {
			validator: (str: string) =>
				/^(photo|doc|video|audio|link)-?[0-9]+(_[0-9]+)(_[a-z0-9])?/i.test(str),
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

const UserPreferencesSchema = {
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
			validator: (array: number[]) =>
				array.every((number) => Number.isInteger(number) && number >= 0) &&
				array.length > 0,
			message: "Day index must be an integer and mustn't be empty",
		},
	},
	notificationEnabled: {
		type: Boolean,
		default: true,
	},
	default: {},
};
const HomeworkSchema = {
	lesson: {
		type: String,
		validate: {
			validator: isLesson,
			message: 'Lesson must be a set of letters, space or dot ',
		},
	},
	text: String,
	to: {
		type: Date,
		default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
	},
	attachments: {
		type: [attachment],
		default: [],
	},
	createdBy: {
		type: Number,
		validate: {
			validator: isPositiveInteger,
			message: 'Created by must be integer means vk id of user created it',
		},
	},
	pinned: {
		type: Boolean,
		default: false,
	},
	userPreferences: {
		type: Map,
		of: new mongoose.Schema(UserPreferencesSchema, { _id: false }),
		get: (map: Map<string, any>) => Object.fromEntries(map),
		set: (obj: Map<string, any> | object) =>
			obj instanceof Map ? obj : new Map(Object.entries(obj)),
		default: {},
	},
	onlyFor: {
		type: [Number],
		validate: {
			message: 'User vk Ids must be positive integer',
			validator: (vkIds: number[]) => vkIds.every(isPositiveInteger),
		},
		default: [],
	},
	_id: {
		type: mongoose.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
};
const AnnouncementsSchema = {
	text: String,
	attachments: {
		type: [attachment],
		default: [],
	},
	to: Date,
	createdBy: {
		type: Number,
		validate: {
			validator: Number.isInteger,
			message: 'Created by must be integer means vk id of user created it',
		},
	},
	pinned: {
		type: Boolean,
		default: false,
	},
	onlyFor: {
		type: [Number],
		validate: {
			message: 'User vk Ids must be positive integer',
			validator: (vkIds: number[]) => vkIds.every(isPositiveInteger),
		},
		default: [],
	},
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
};

const classSchema = new mongoose.Schema<ClassDocument>({
	students: {
		type: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Student',
			},
		],
		default: [],
	},
	name: {
		type: String,
		validate: {
			validator: isValidClassName,
			message: 'Class name must match digit + letter',
		},
		required: true,
	},
	homework: {
		type: [HomeworkSchema],
		default: [],
	},
	schedule: {
		type: [
			[
				{
					type: String,
					validate: {
						validator: isLesson,
						message: 'Lesson must be a set of letters, space or dot ',
					},
				},
			],
		],
		default: Array.from({ length: 6 }, () => []),
	},
	announcements: {
		type: [AnnouncementsSchema],
		default: [],
	},
	schoolName: {
		type: String,
		ref: 'Student',
		required: true,
	},
});

export default mongoose.model<ClassDocument>('Class', classSchema);
function isPositiveInteger(n: number) {
	return Number.isInteger(n) && n > 0;
}
