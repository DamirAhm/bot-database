const Roles = {
    student: "STUDENT",
    admin: "ADMIN",
    contributor: "CONTRIBUTOR"
};
const Lessons = [
    "Ничего",
    "Алгебра",
    "Английский",
    "Астрономия",
    "Биология",
    "География",
    "Геометрия",
    "Информатика",
    "История",
    "Классный час",
    "Литература",
    "Математика",
    "ОБЖ",
    "Обществознание",
    "Подготовка к итоговому сочинению",
    "Регионоведение",
    "Русский",
    "Технология",
    "Физика",
    "Физкультура",
    "Химия",
    "Экономика",
    "Экология",
    "Какой то электив (Хуета)",
];
const checkValidTime = ( str ) => {
    return typeof str === "string" && ( !isNaN( +str[ 0 ] ) && +str[ 0 ] >= 0 ) && ( !isNaN( +str[ 1 ] ) && +str[ 1 ] >= 0 ) && str[ 2 ] === ":" && ( !isNaN( +str[ 3 ] ) && +str[ 3 ] >= 0 ) && ( !isNaN( +str[ 4 ] ) && +str[ 4 ] >= 0 );
};

const isURL = str => /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test( str );//

const daysOfWeek = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
]

const isValidClassName = ( name ) => {
    if ( /(^\d{2})([A-Z]|[А-Я])/i.test( name ) ) {
        const [ _, digit, letter ] = name.match( /(^\d{2})([A-Z]|[А-Я])/i );
        return +digit > 0 && +digit <= 11 && Number.isInteger( digit );
    }
    return false;
}

module.exports = {
    Roles,
    Lessons,
    checkValidTime,
    isURL,
    daysOfWeek,
    isValidClassName
};