import { ISchool, SchoolDocument } from '../types';
import mongoose from 'mongoose';
import { checkValidTime, inRange } from './utils';

const isValidSchoolName = (str: string) => /^[a-z]+:\d{1,}$/i.test(str);

const lessonCallsSchema = {
	start: {
		type: String,
		required: true,
		validate: {
			message: "Start must be a valid string in format '00:00'",
			validator: checkValidTime,
		},
	},
	end: {
		type: String,
		required: true,
		validate: {
			message: "End must be a valid string in format '00:00'",
			validator: checkValidTime,
		},
	},
};
const callScheduleSchema = {
	defaultSchedule: {
		type: [lessonCallsSchema],
		default: [],
		validate: {
			message: 'Times in array must be sorted',
			validator: (arr: string[]) => {
				const sortedArr = arr.sort();

				return arr.every((el, i) => sortedArr[i] === el);
			},
		},
	},
	exceptions: {
		type: [
			{
				type: [lessonCallsSchema],
				default: [],
				validate: {
					message: 'Times in array must be sorted',
					validator: (arr: string[]) => {
						const sortedArr = arr.sort();

						return arr.every((el, i) => sortedArr[i] === el);
					},
				},
			},
		],
		default: [[], [], [], [], [], []],
		validate: {
			message: 'Exceptions array must be a length of 6',
			validate: (arr: any[]) => inRange(arr.length, 0, 6),
		},
	},
};

export const schoolSchema = new mongoose.Schema<SchoolDocument>({
	classes: {
		type: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Class',
			},
		],
		default: [],
	},
	callSchedule: {
		type: callScheduleSchema,
		default: {
			defaultSchedule: [],
			exceptions: [[], [], [], [], [], []],
		},
	},
	name: {
		type: String,
		valudate: {
			validator: isValidSchoolName,
			message: 'School name must fit format',
		},
		required: true,
		unique: true,
	},
});

schoolSchema.virtual('city', {}).get(function () {
	//@ts-ignore
	return (this.name ?? '').split(':')[0];
});
schoolSchema.virtual('number').get(function () {
	//@ts-ignore
	return (this.name ?? '').split(':')[1];
});

export default mongoose.model<SchoolDocument>('School', schoolSchema);
