import { IStudent, IContent, IHomework } from "bot-database";
import mongoose from 'mongoose';
export declare const dayInMilliseconds: number;
export declare const findNextDayWithLesson: (schedule: string[][], lesson: string, currentWeekDay: number) => number;
export declare const findNextLessonDate: (nextLessonWeekDay: number, { currentDate }?: {
    currentDate?: Date | undefined;
}) => Date;
export declare const toObject: (Document: mongoose.Document) => any;
export declare const isObjectId: (id: string) => boolean;
export declare const findNotifiedStudents: (students: IStudent[], notificationDate: Date, maxRemindFrequency: number) => IStudent[];
export declare const lessonsIndexesToLessonsNames: (lessonList: string[], indexes: number[][]) => string[][];
export declare const checkIsToday: (date: Date, to?: Date) => boolean;
export declare const isPartialOf: (object: object, instance: object) => boolean;
export declare const filterContentByDate: (content: IContent[], date: Date) => IContent[];
export declare const mapHomeworkByLesson: (homework: IHomework) => any;
