const Roles = {
    student: "STUDENT",
    admin: "ADMIN",
    contributor: "CONTRIBUTOR"
};
const Lessons = [
    "Математика",
    "Английский",
    "Русский",
    "Экономика",
    "География",
    "Физика",
    "Физкультура",
    "Алгебра",
    "Геометрия",
    "Литература",
    "История",
    "Обществознание",
    "Регионоведение",
    "Химия",
    "Биология",
    "Астрономия",
    "ОБЖ",
    "Информатика",
    "Технология",
    "Классный час",
    "Ничего"
];
const checkValidTime = ( str ) => {
    return typeof str === "string" && ( !isNaN( +str[ 0 ] ) && +str[ 0 ] >= 0 ) && ( !isNaN( +str[ 1 ] ) && +str[ 1 ] >= 0 ) && str[ 2 ] === ":" && ( !isNaN( +str[ 3 ] ) && +str[ 3 ] >= 0 ) && ( !isNaN( +str[ 4 ] ) && +str[ 4 ] >= 0 );
};

const isURL = str => /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test( str );//


module.exports = {
    Roles,
    Lessons,
    checkValidTime,
    isURL
};