"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidClassName = exports.daysOfWeek = exports.isURL = exports.checkValidTime = exports.Lessons = exports.Roles = void 0;
var Roles;
(function (Roles) {
    Roles["student"] = "STUDENT";
    Roles["admin"] = "ADMIN";
    Roles["contributor"] = "CONTRIBUTOR";
})(Roles = exports.Roles || (exports.Roles = {}));
;
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
const checkValidTime = (str) => {
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
exports.checkValidTime = checkValidTime;
const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const isURL = (str) => urlRegExp.test(str);
exports.isURL = isURL;
exports.daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const isValidClassName = (name) => {
    if (/(^\d{2})([A-Z]|[А-Я])/i.test(name)) {
        const [_, digit] = name.match(/(^\d{2})([A-Z]|[А-Я])/i);
        return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
    }
    return false;
};
exports.isValidClassName = isValidClassName;
//# sourceMappingURL=utils.js.map