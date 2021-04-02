import { Roles } from './Models/utils';
import mongoose from 'mongoose';
import { ClassDocument, IAnnouncement, IAttachment, IClassData, ICreateAnnouncement, ICreateContent, ICreateHomework, ICreateStudentParams, IHomework, ISettings, lessonCalls, PopulatedClass, PopulatedSchool, PopulatedStudent, SchoolDocument, StudentDocument } from './types';
declare type ObjectId = mongoose.Types.ObjectId;
export declare class DataBase {
    uri: string;
    constructor(uri: string);
    getSchoolByName(schoolName: string): Promise<SchoolDocument | null>;
    getSchoolBy_Id(_id: string | ObjectId): Promise<SchoolDocument | null>;
    getStudentByVkId(vkId: number): Promise<StudentDocument | null>;
    getStudentBy_Id(_id: string | ObjectId): Promise<StudentDocument | null>;
    getClassByName(name: string, schoolName: string): Promise<ClassDocument | null>;
    getClassBy_Id(_id: string | ObjectId): Promise<ClassDocument | null>;
    getAllContributors(schoolName?: string): Promise<StudentDocument[]>;
    getAllStudents(schoolName?: string): Promise<StudentDocument[]>;
    getAllClasses(schoolName?: string): Promise<ClassDocument[]>;
    getAllSchools(): Promise<SchoolDocument[]>;
    getStudentsCount(classNameOrInstance: string | ClassDocument | PopulatedClass, schoolName: string): Promise<any>;
    getStudentsFromClass(classNameOrInstance: string | ClassDocument | PopulatedClass, schoolName: string): Promise<StudentDocument[]>;
    getClassesForSchool(schoolNameOrInstance: string | SchoolDocument | PopulatedSchool): Promise<ClassDocument[]>;
    getStudentsForSchool(schoolNameOrInstance: string | SchoolDocument | PopulatedSchool): Promise<StudentDocument[]>;
    getSchoolsForCity(cityName: string): Promise<SchoolDocument[]>;
    getSchoolForStudent(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent): Promise<SchoolDocument | null>;
    getClassForStudent(idOrInstance: number | StudentDocument | PopulatedStudent): Promise<ClassDocument | null>;
    createStudent(vkId: number, { class_id, firstName, lastName, registered, }: ICreateStudentParams): Promise<StudentDocument | null>;
    createClass(name: string, schoolName: string): Promise<ClassDocument | null>;
    createSchool(name: string): Promise<SchoolDocument>;
    addHomework(classData: IClassData, content: ICreateHomework, studentVkId: number, expirationDate?: Date): Promise<mongoose.Types.ObjectId | null>;
    removeHomework(classData: IClassData, homeworkId: string | ObjectId): Promise<boolean>;
    getHomework(classData: IClassData, date?: Date): Promise<IHomework[]>;
    updateHomework(classData: IClassData, homeworkId: string, updates: Partial<Omit<IHomework, '_id'>>): Promise<IHomework[] | null>;
    getHomeworkByDate(classData: IClassData, date: Date): Promise<IHomework[]>;
    removeOldHomework(classData: IClassData, maxDate?: Date): Promise<IHomework[]>;
    togglePinHomework(classData: IClassData, homeworkId: string | ObjectId): Promise<boolean>;
    unpinAllHomework(classData: IClassData): Promise<boolean>;
    parseHomeworkToNotifications(currentDateForTest: Date): Promise<(number[] | IHomework[])[][]>;
    setSchedule(classData: IClassData, newSchedule: string[][]): Promise<boolean>;
    changeDay(classData: IClassData, dayIndex: number, newLessonsForDay: string[]): Promise<false | string[][]>;
    getSchedule(classData: IClassData): Promise<string[][]>;
    getCallCheduleForDay(classData: IClassData, dayIndex: number): Promise<lessonCalls[] | null>;
    addCallScheduleException(classData: IClassData, dayIndex: number, schedule: lessonCalls[]): Promise<boolean>;
    getLessonAtSpecificTime(callSchedule: lessonCalls[], date: Date): lessonCalls;
    getNextCallTime(callSchedule: lessonCalls[], date: Date): string;
    addAnnouncement(classData: IClassData, content: ICreateAnnouncement, toDate: Date | undefined, toAll: boolean | undefined, vkId: number): Promise<mongoose.Types.ObjectId | null>;
    getAnnouncements(classData: IClassData, date?: Date): Promise<IAnnouncement[] | null>;
    removeAnnouncement(classData: IClassData, announcementId: string | ObjectId): Promise<IAnnouncement[] | null>;
    updateAnnouncement(classData: IClassData, announcementId: string | ObjectId, updates: Partial<Omit<IAnnouncement, '_id'>>): Promise<IAnnouncement[] | null>;
    removeOldAnnouncements(classData: IClassData, maxDate?: Date): Promise<IAnnouncement[]>;
    togglePinAnnouncement(classData: IClassData, announcementId: string | ObjectId): Promise<boolean>;
    unpinAllAnnouncements(classData: IClassData): Promise<boolean>;
    changeSettings(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent, diffObject: Partial<ISettings>): Promise<boolean>;
    changeLastHomeworkCheckDate(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent, newCheckDate: Date): Promise<boolean>;
    getRole(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent): Promise<Roles | null | undefined>;
    backStudentToInitialRole(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent): Promise<boolean>;
    addStudentToClass(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent, classNameOrInstance: string | ClassDocument | PopulatedClass, schoolName?: string): Promise<boolean>;
    removeStudentFromClass(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent): Promise<boolean>;
    changeClass(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent, newClassNameOrInstance: string | ClassDocument | PopulatedClass, schoolName?: string): Promise<boolean>;
    populate(document: SchoolDocument): Promise<PopulatedSchool>;
    populate(document: StudentDocument): Promise<PopulatedStudent>;
    populate(document: ClassDocument): Promise<PopulatedClass>;
    validateContent(content: ICreateContent): string[];
    validateAttachment(attachment: IAttachment): boolean;
    validateDate(date: Date | string | number, maxDate?: Date, minDate?: Date): boolean;
    getClassByClassData({ classNameOrInstance, schoolName }: IClassData): Promise<PopulatedClass | ClassDocument | null>;
    getStudentByStudentData(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent): Promise<StudentDocument | PopulatedStudent | null>;
    connect(...args: any[]): void;
}
export {};
