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
exports.checkValidTime = (str) => {
    return (!isNaN(+str[0]) &&
        +str[0] >= 0 &&
        !isNaN(+str[1]) &&
        +str[1] >= 0 &&
        str[2] === ':' &&
        !isNaN(+str[3]) &&
        +str[3] >= 0 &&
        !isNaN(+str[4]) &&
        +str[4] >= 0);
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
exports.isValidClassName = (name) => {
    if (/(^\d{1,2})([A-Z]|[А-Я])/i.test(name)) {
        const [_, digit] = name.match(/(^\d{1,2})([A-Z]|[А-Я])/i);
        return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
    }
    return false;
};
