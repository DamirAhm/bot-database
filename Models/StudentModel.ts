import mongoose from 'mongoose';
import { Roles, checkValidTime } from './utils';

const studentSchema = new mongoose.Schema<IStudent>({
	class: {
		type: mongoose.Types.ObjectId,
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
				validator: (array: number[]) =>
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
			validator: (date: Date) => Date.now() - date.getTime() >= 0,
			message: 'Last check of homework time can`t be in the future',
		},
	},
	fullName: {
		type: String,
		required: true,
	},
	registered: {
		type: Boolean,
		default: false,
	},
});

const fullNameRegExp = /^\w*\s\w*$/;
const isValidFullName = (str: string) => fullNameRegExp.test(str);

studentSchema
	.virtual('firstName')
	.get(function () {
		//@ts-ignore
		return this.fullName.split(' ')[0];
	})
	.set(function (value: string) {
		if (isValidFullName(value)) {
			//@ts-ignore
			this.fullName = (this.fullName ?? '').replace(/^\w*/, value.toString());
		} else {
			//@ts-ignore
			this.fullName = value;
		}
	});

studentSchema
	.virtual('secondName')
	.get(function () {
		//@ts-ignore
		return this.fullName.split(' ')[1];
	})
	.set(function (value: string) {
		if (isValidFullName(value)) {
			//@ts-ignore
			this.fullName = (this.fullName ?? '').replace(/\w*$/, value.toString());
		} else {
			//@ts-ignore
			this.fullName += ` ${value}`;
		}
	});

export default mongoose.model<StudentDocument>('Student', studentSchema);