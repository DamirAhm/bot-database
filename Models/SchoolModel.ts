import { ISchool, SchoolDocument } from '../types';
import mongoose from 'mongoose';

const isValidSchoolName = (str: string) => /^.*:\d*$/.test(str);

export const schoolSchema = new mongoose.Schema<ISchool>({
	classes: {
		type: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'Class',
			},
		],
		default: [],
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
