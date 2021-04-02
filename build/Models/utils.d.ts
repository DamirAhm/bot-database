export declare enum Roles {
    student = "STUDENT",
    admin = "ADMIN",
    contributor = "CONTRIBUTOR"
}
export declare const Lessons: readonly ["Ничего", "Алгебра", "Английский", "Астрономия", "Биология", "География", "Геометрия", "Информатика", "История", "Литература", "Математика", "ОБЖ", "Обществознание", "Русский", "Технология", "Физика", "Физкультура", "Химия"];
export declare function inRange(number: number, min: number, max: number): boolean;
export declare const timeRegExp: RegExp;
export declare const checkValidTime: (str: string) => boolean;
export declare const compareTimes: (a: string, b: string) => boolean;
export declare const isLesson: (str: string) => boolean;
export declare const isURL: (str: string) => boolean;
export declare const daysOfWeek: readonly ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
export declare const classNameRegExp: RegExp;
export declare const isValidClassName: (name: string) => boolean;
export declare const getTimeFromDate: (date: Date) => string;
