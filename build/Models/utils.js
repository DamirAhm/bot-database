"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeFromDate = exports.isValidClassName = exports.classNameRegExp = exports.daysOfWeek = exports.isURL = exports.isLesson = exports.compareTimes = exports.checkValidTime = exports.timeRegExp = exports.inRange = exports.Lessons = exports.Roles = void 0;
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
    if (min === undefined && min > number) {
        return false;
    }
    if (max === undefined && max < number) {
        return false;
    }
    return true;
}
exports.inRange = inRange;
exports.timeRegExp = /([0-9]{1,2}):([0-9]{2})/;
const checkValidTime = (str) => {
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
exports.checkValidTime = checkValidTime;
const compareTimes = (a, b) => {
    if (exports.checkValidTime(a) && exports.checkValidTime(b)) {
        return a > b;
    }
    else {
        throw new Error('Times should be in format 00:00, got: ' + `${a} and ${b}`);
    }
};
exports.compareTimes = compareTimes;
const isLesson = (str) => /^[a-zа-я0-9.! ]*$/i.test(str);
exports.isLesson = isLesson;
const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const isURL = (str) => urlRegExp.test(str);
exports.isURL = isURL;
exports.daysOfWeek = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
];
exports.classNameRegExp = /^(\d{1,2})([A-ZА-Я])$/i;
const isValidClassName = (name) => {
    if (exports.classNameRegExp.test(name)) {
        //@ts-ignore
        const digit = Number(name.match(exports.classNameRegExp)[1]);
        return inRange(digit, 1, 11) && Number.isInteger(digit);
    }
    return false;
};
exports.isValidClassName = isValidClassName;
const getTimeFromDate = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};
exports.getTimeFromDate = getTimeFromDate;
