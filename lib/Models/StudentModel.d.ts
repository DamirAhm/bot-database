import * as mongoose from 'mongoose';
import { ClassDocument } from "./ClassModel";
import { Roles } from "./utils";
export interface PopulatedStudent extends Omit<StudentDocument, 'class'> {
    class: ClassDocument;
}
export interface StudentDocument extends IStudent, mongoose.Document {
}
export interface IStudent {
    class: mongoose.Types.ObjectId | null;
    role: Roles;
    vkId: number;
    settings: ISettings;
    lastHomeworkCheck: Date;
    fullName: number;
    registered: boolean;
    firstName: string;
    lastName: string;
}
export interface ISettings {
    notificationTime: string;
    notificationsEnabled: boolean;
    daysForNotifications: number[];
}
declare const _default: mongoose.Model<StudentDocument, {}>;
export default _default;
