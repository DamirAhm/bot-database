import * as mongoose from 'mongoose';
import { StudentDocument } from "./StudentModel";
export interface PopulatedClass extends Omit<ClassDocument, 'students'> {
    students: StudentDocument[];
}
export interface ClassDocument extends IClass, mongoose.Document {
}
export interface IClass {
    students: mongoose.Types.ObjectId[];
    name: string;
    homework: IHomework[];
    announcements: IAnnouncement[];
    schedule: string[][];
    schoolName: string;
}
export interface IHomework extends IContent {
    lesson: string;
}
export interface IAnnouncement extends IContent {
}
export interface IContent {
    text: string;
    to: Date;
    attachments: IAttachment[];
    pinned: boolean;
    _id: mongoose.Types.ObjectId;
    createdBy?: number;
}
export interface IAttachment {
    value: string;
    url: string;
    album_id: number;
}
declare const _default: mongoose.Model<ClassDocument, {}>;
export default _default;
