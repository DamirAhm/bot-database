import * as mongoose from 'mongoose';
export var dayInMilliseconds = 24 * 60 * 60 * 1000;
export var findNextDayWithLesson = function (schedule, lesson, currentWeekDay) {
    var lastIndex = -1;
    if (schedule.slice(currentWeekDay).find(function (e) { return e.includes(lesson); })) {
        lastIndex =
            schedule.slice(currentWeekDay).findIndex(function (e) { return e.includes(lesson); }) +
                currentWeekDay +
                1;
    }
    else if (schedule.find(function (e) { return e.includes(lesson); })) {
        lastIndex = schedule.findIndex(function (e) { return e.includes(lesson); }) + 1;
    }
    return lastIndex;
};
export var findNextLessonDate = function (nextLessonWeekDay, _a) {
    var _b = (_a === void 0 ? {} : _a).currentDate, currentDate = _b === void 0 ? new Date() : _b;
    if (nextLessonWeekDay <= 7 && nextLessonWeekDay > 0) {
        var weekDay = currentDate.getDay() || 7; //Чтобы воскресенье было 7 днем недели
        var addition = nextLessonWeekDay <= weekDay ? 7 : 0; //Равно 7 если урок на следующей неделе
        var date = currentDate.getDate() + addition - (weekDay - nextLessonWeekDay);
        var month = currentDate.getMonth();
        return new Date(currentDate.getFullYear(), month, date);
    }
    else if (nextLessonWeekDay < 0) {
        throw new Error("Next lesson week day must be in range from 0 to 6");
    }
    else {
        throw new TypeError('Week day must be less or equal to 7');
    }
};
export var toObject = function (Document) { return JSON.parse(JSON.stringify(Document)); };
export var isObjectId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
};
export var findNotifiedStudents = function (students, notificationDate, maxRemindFrequency) {
    return students.filter(function (_a) {
        var sets = _a.settings, lastHomeworkCheck = _a.lastHomeworkCheck;
        var _b;
        if (sets.notificationsEnabled) {
            //Проверяет что уведомления включены
            if (notificationDate.getHours() === Number((_b = sets.notificationTime.match(/^\d*/)) === null || _b === void 0 ? void 0 : _b[0]) &&
                Math.abs(notificationDate.getMinutes() - Number(sets.notificationTime.match(/\d*$/))) <= 1) {
                //Проверяет что время совпадает или почти
                if (Number(notificationDate) - Number(lastHomeworkCheck) >= maxRemindFrequency) {
                    //Проверяет что чел недавно (3 часа) сам не чекал дз}
                    return true;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    });
};
export var lessonsIndexesToLessonsNames = function (lessonList, indexes) {
    if (Array.isArray(lessonList) &&
        lessonList.length &&
        lessonList.every(function (el) { return typeof el === 'string'; })) {
        if (Array.isArray(indexes) &&
            indexes.length > 0 &&
            indexes.every(function (lesson) { return Array.isArray(lesson) && lesson.every(Number.isInteger); }) //lessonList должен быть массивом массивов целых чисел
        ) {
            if (lessonList.length - 1 < Math.max.apply(Math, indexes.flat())) {
                throw new ReferenceError('Index in indexes array can`t be bigger than lesson list length');
            }
            return indexes.map(function (dayIdxs) { return dayIdxs.map(function (idx) { return lessonList[idx]; }); }); //превращает массив индексов в массив предметов
        }
        else {
            throw new TypeError('lessonsIndexesByDays must be array of arrays of integers');
        }
    }
    else {
        throw new TypeError('LessonList must be array of strings');
    }
};
export var checkIsToday = function (date, to) {
    if (to === void 0) { to = new Date(); }
    return (to.getDate() === date.getDate() &&
        date.getMonth() === to.getMonth() &&
        date.getFullYear() === to.getFullYear());
};
export var isPartialOf = function (object, instance) {
    if (Array.isArray(object))
        return Object.keys(instance).every(function (key) { return object.includes(key); });
    if (typeof object === 'object')
        return (Object.keys(instance).length !== 0 &&
            Object.keys(instance).every(function (key) { return object.hasOwnProperty(key); }));
    throw new TypeError('object must be an object or an array of properties');
};
export var filterContentByDate = function (content, date) {
    return content.filter(function (cont) {
        return Math.abs(cont.to.getTime() - date.getTime()) <= dayInMilliseconds &&
            cont.to.getDate() === date.getDate();
    });
};
export var mapHomeworkByLesson = function (homework) {
    if (homework instanceof Array) {
        return homework.reduce(function (acc, c) { return (acc.has(c.lesson) ? acc.get(c.lesson).push(c) : acc.set(c.lesson, [c]), acc); }, new Map());
    }
    else {
        throw new TypeError('homework must be an array');
    }
};
