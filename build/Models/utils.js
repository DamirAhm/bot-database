"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Roles;
(function (Roles) {
    Roles["student"] = "STUDENT";
    Roles["admin"] = "ADMIN";
    Roles["contributor"] = "CONTRIBUTOR";
})(Roles = exports.Roles || (exports.Roles = {}));
exports.Lessons = [
    'Ничего',
    'Алгебра',
    'Английский',
    'Астрономия',
    'Биология',
    'География',
    'Геометрия',
    'Информатика',
    'История',
    'Литература',
    'Математика',
    'ОБЖ',
    'Обществознание',
    'Русский',
    'Технология',
    'Физика',
    'Физкультура',
    'Химия',
];
function inRange(number, min, max) {
    if (min ?? min > number) {
        return false;
    }
    if (max ?? max < number) {
        return false;
    }
    return true;
}
exports.inRange = inRange;
exports.timeRegExp = /(\d{2}):(\d{2})/;
exports.checkValidTime = (str) => {
    if (exports.timeRegExp.test(str)) {
        //@ts-ignore
        const [hours, minutes] = str
            .match(exports.timeRegExp)
            .slice(1)
            .map((n) => parseInt(n));
        if (!isNaN(hours) && !isNaN(minutes) && inRange(hours, 0, 23) && inRange(minutes, 0, 59)) {
            return true;
        }
    }
    return false;
};
exports.compareTimes = (a, b) => {
    if (exports.checkValidTime(a) && exports.checkValidTime(b)) {
        return a > b;
    }
    else {
        throw new Error('Times should be in format: 00:00');
    }
};
exports.isLesson = (str) => /^[a-zа-я0-9.! ]*$/i.test(str);
const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
exports.isURL = (str) => urlRegExp.test(str);
exports.daysOfWeek = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
];
exports.classNameRegExp = /^(\d{1,2})([A-ZА-Я])$/i;
exports.isValidClassName = (name) => {
    if (exports.classNameRegExp.test(name)) {
        //@ts-ignore
        const digit = Number(name.match(exports.classNameRegExp)[1]);
        return inRange(digit, 1, 11) && Number.isInteger(digit);
    }
    return false;
};
exports.getTimeFromDate = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes}`;
};
