import mongoose from 'mongoose';
import { ClassDocument } from "./ClassModel";
export interface PopulatedSchool extends Omit<SchoolDocument, "classes"> {
    classes: ClassDocument[];
}
export interface SchoolDocument extends ISchool, mongoose.Document {
}
export interface ISchool {
    classes: mongoose.Types.ObjectId[];
    name: string;
}
export declare const schoolSchema: mongoose.Schema<ISchool>;
declare const _default: mongoose.Model<SchoolDocument, {}>;
export default _default;
