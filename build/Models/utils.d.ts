export declare enum Roles {
    student = "STUDENT",
    admin = "ADMIN",
    contributor = "CONTRIBUTOR"
}
export declare const Lessons: readonly ["Ничего", "Алгебра", "Английский", "Астрономия", "Биология", "География", "Геометрия", "Информатика", "История", "Литература", "Математика", "ОБЖ", "Обществознание", "Русский", "Технология", "Физика", "Физкультура", "Химия"];
export declare const checkValidTime: (str: string) => boolean;
export declare const isURL: (str: string) => boolean;
export declare const daysOfWeek: readonly ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
export declare const isValidClassName: (name: string) => boolean;
