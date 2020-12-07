import mongoose from 'mongoose';
import { ClassDocument } from "./ClassModel";

export interface PopulatedSchool extends Omit<SchoolDocument, "classes"> {
	classes: ClassDocument[]
}
export interface SchoolDocument extends ISchool, mongoose.Document { }
export interface ISchool {
	classes: mongoose.Types.ObjectId[]
	name: string
}

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
			validator: (str: string) => /^.*:\d*$/.test(str),
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

export default mongoose.model<SchoolDocument>("School", schoolSchema);