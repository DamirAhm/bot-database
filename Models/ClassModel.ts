import { IClass, ClassDocument } from '../types';
import mongoose from 'mongoose';
import { isURL } from './utils';

const isLesson = (str: string) => /^[a-zа-я0-9.! ]*$/i.test(str);

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

const classSchema = new mongoose.Schema<IClass>({
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
			validator: (name: string) => {
				if (/^\d{1,2}[a-zа-я]+$/i.test(name)) {
					const [_, digit] = name.match(/^(\d{1,2})([a-zа-я]+)$/i) as RegExpMatchArray;
					return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
				}
				return false;
			},
			message: 'Class name must match digit + letter',
		},
		required: true,
	},
	homework: {
		type: [
			{
				lesson: {
					required: true,
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
						validator: Number.isInteger,
						message: 'Created by must be integer means vk id of user created it',
					},
				},
				pinned: {
					type: Boolean,
					default: false,
				},
				_id: {
					type: mongoose.Types.ObjectId,
					default: new mongoose.Types.ObjectId(),
				},
			},
		],
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
		default: [[], [], [], [], [], []],
	},
	announcements: {
		type: [
			{
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
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					default: new mongoose.Types.ObjectId(),
				},
			},
		],
		default: [],
	},
	schoolName: {
		type: String,
		ref: 'Student',
		required: true,
	},
});

export default mongoose.model<ClassDocument>('Class', classSchema);
