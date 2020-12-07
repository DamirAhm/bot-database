export var Roles;
(function (Roles) {
    Roles["student"] = "STUDENT";
    Roles["admin"] = "ADMIN";
    Roles["contributor"] = "CONTRIBUTOR";
})(Roles || (Roles = {}));
;
export const Lessons = [
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
export const checkValidTime = (str) => {
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
const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
export const isURL = (str) => urlRegExp.test(str);
export const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
export const isValidClassName = (name) => {
    if (/(^\d{2})([A-Z]|[А-Я])/i.test(name)) {
        const [_, digit] = name.match(/(^\d{2})([A-Z]|[А-Я])/i);
        return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
    }
    return false;
};
