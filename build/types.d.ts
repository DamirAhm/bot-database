import { Roles } from './Models/utils';
import mongoose from 'mongoose';
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
export interface IUserPreferences {
    notificationTime: string | null;
    notificationEnabled: boolean | null;
    daysForNotification: number[] | null;
}
export interface IHomework extends IContent {
    lesson: string;
    userPreferences: {
        [studentVkId: string]: IUserPreferences;
    };
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
    onlyFor?: number[];
}
export interface IAttachment {
    value: string;
    url: string;
    album_id: number;
}
export interface ICreateContent {
    text: string;
    attachments: IAttachment[];
    pinned?: boolean;
    createdBy?: number;
    onlyFor?: number[];
}
export interface ICreateHomework extends ICreateContent {
    lesson: string;
}
export interface ICreateAnnouncement extends ICreateContent {
}
export interface PopulatedSchool extends Omit<SchoolDocument, 'classes'> {
    classes: ClassDocument[];
}
export interface SchoolDocument extends ISchool, mongoose.Document {
}
export interface ISchool {
    classes: mongoose.Types.ObjectId[];
    name: string;
}
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
    fullName: string;
    registered: boolean;
    firstName: string;
    lastName: string;
}
export interface ISettings {
    notificationTime: string;
    notificationsEnabled: boolean;
    daysForNotification: number[];
}
export interface ICreateStudentParams {
    class_id?: string | null;
    firstName: string;
    lastName: string;
    registered: boolean;
    schoolName?: string;
}
export interface IClassData {
    classNameOrInstance: string | ClassDocument | PopulatedClass;
    schoolName: string;
}
export interface IVkUser {
    last_name: string;
    first_name: string;
    id: number;
    deactivated?: string;
    is_closed: boolean;
    can_access_closed: boolean;
}
