"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./Models/utils");
const StudentModel_1 = tslib_1.__importDefault(require("./Models/StudentModel"));
const SchoolModel_1 = tslib_1.__importDefault(require("./Models/SchoolModel"));
const ClassModel_1 = tslib_1.__importDefault(require("./Models/ClassModel"));
const functions_1 = require("./utils/functions");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const isObjectId = mongoose_1.default.Types.ObjectId.isValid;
const getPureDate = (date) => {
    if (date && date instanceof Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day);
    }
    else {
        throw new Error('Ожидалась дата, дано: ' + JSON.stringify(date));
    }
};
function isClassPopulated(Document) {
    return typeof Document === 'object' && 'vkId' in Document.students[0];
}
function isStudentPopulated(Document) {
    return typeof Document === 'object' && (Document.class === null || 'name' in Document.class);
}
function isSchoolPopulated(Document) {
    return typeof Document === 'object' && 'name' in Document.classes[0];
}
//TODO Replace returns of false and null to errors or error codes
class DataBase {
    constructor(uri) {
        if (uri) {
            this.uri = uri;
        }
        else {
            throw new Error('You must pass an DataBase uri to constructor');
        }
    }
    //! Getters
    async getSchoolByName(schoolName) {
        return await SchoolModel_1.default.findOne({ name: schoolName });
    }
    async getSchoolBy_Id(_id) {
        return await SchoolModel_1.default.findById(_id);
    }
    async getStudentByVkId(vkId) {
        return await StudentModel_1.default.findOne({ vkId });
    } //Возвращает ученика по его id из vk
    async getStudentBy_Id(_id) {
        return await StudentModel_1.default.findById(_id);
    } //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))
    async getClassByName(name, schoolName) {
        return await ClassModel_1.default.findOne({ name, schoolName });
    } //Возвращает класс по его имени
    async getClassBy_Id(_id) {
        return await ClassModel_1.default.findById(_id);
    } //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))
    async getAllContributors(schoolName) {
        let classes;
        if (schoolName) {
            classes = await this.getClassesForSchool(schoolName);
        }
        else {
            classes = await this.getAllClasses();
        }
        return Promise.all(classes
            .reduce((acc, c) => acc.concat(c.students), [])
            .map((studentId) => this.getStudentBy_Id(studentId))).then((students) => students.filter((student) => student !== null).filter(({ role }) => [utils_1.Roles.contributor, utils_1.Roles.admin].includes(role)));
    } //Возвращает список всех редакторов
    async getAllStudents(schoolName) {
        let classes;
        if (schoolName) {
            classes = await this.getClassesForSchool(schoolName);
        }
        else {
            return await StudentModel_1.default.find({});
        }
        return Promise.all(classes
            .reduce((acc, c) => acc.concat(c.students), [])
            .map((studentId) => this.getStudentBy_Id(studentId))).then((students) => students.filter((student) => student !== null));
    }
    async getAllClasses(schoolName) {
        return (await ClassModel_1.default.find(!schoolName ? {} : { schoolName })) || [];
    }
    async getAllSchools() {
        return await SchoolModel_1.default.find({});
    }
    async getStudentsCount(classNameOrInstance, schoolName) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            return await StudentModel_1.default.count({ class: Class._id });
        }
        else {
            return 0;
        }
    }
    async getStudentsFromClass(classNameOrInstance, schoolName) {
        if (typeof classNameOrInstance === 'object' && isClassPopulated(classNameOrInstance)) {
            return classNameOrInstance.students;
        }
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const { students } = await this.populate(Class);
            return students;
        }
        else {
            return [];
        }
    }
    async getClassesForSchool(schoolNameOrInstance) {
        if (typeof schoolNameOrInstance === 'string') {
            return ClassModel_1.default.find({ schoolName: schoolNameOrInstance });
        }
        else {
            return ClassModel_1.default.find({ schoolName: schoolNameOrInstance.name });
        }
    }
    async getStudentsForSchool(schoolNameOrInstance) {
        //Any because ts is dumb and doesn't want to understand that /|\ type is OK for overloads
        const Classes = await this.getClassesForSchool(schoolNameOrInstance);
        if (Classes) {
            const PopulatedClasses = await Promise.all(Classes.map((Class) => this.populate(Class)));
            const schoolStudents = PopulatedClasses.reduce((acc, c) => acc.concat(c.students), []);
            return schoolStudents;
        }
        return [];
    }
    async getSchoolsForCity(cityName) {
        const Schools = await SchoolModel_1.default.find({
            name: { $regex: new RegExp(`^${cityName}:`) },
        });
        return Schools || [];
    }
    async getSchoolForStudent(vkIdOrStudentInstance) {
        if (typeof vkIdOrStudentInstance === 'object' &&
            isStudentPopulated(vkIdOrStudentInstance)) {
            if (vkIdOrStudentInstance.class) {
                return this.getSchoolByName(vkIdOrStudentInstance.class.schoolName);
            }
            else {
                return null;
            }
        }
        let Student;
        if (typeof vkIdOrStudentInstance === 'number') {
            Student = await this.getStudentByVkId(vkIdOrStudentInstance);
        }
        else {
            Student = vkIdOrStudentInstance;
        }
        if (Student) {
            const { class: Class } = await this.populate(Student);
            if (Class) {
                return await this.getSchoolByName(Class.schoolName);
            }
        }
        return null;
    }
    async getClassForStudent(idOrInstance) {
        if (typeof idOrInstance === 'object') {
            if (isStudentPopulated(idOrInstance)) {
                return idOrInstance.class;
            }
            else {
                if (idOrInstance.class === null)
                    return null;
                return await this.getClassBy_Id(idOrInstance.class);
            }
        }
        const Student = await this.getStudentByVkId(idOrInstance);
        if (Student) {
            return ClassModel_1.default.findById(Student.class);
        }
        return null;
    }
    //! Creators
    async createStudent(vkId, { class_id = null, firstName = undefined, lastName: secondName = undefined, registered = false, }) {
        let newStudentInfo = { vkId, firstName, secondName, registered };
        const newStudent = new StudentModel_1.default(newStudentInfo);
        if (class_id) {
            const Class = await this.getClassBy_Id(class_id);
            if (Class) {
                await Class.updateOne({
                    $addToSet: {
                        students: newStudent._id,
                    },
                });
                await newStudent.updateOne({
                    class: Class._id,
                    role: Class.students.length === 0 ? utils_1.Roles.contributor : newStudent.role,
                });
            }
        }
        await newStudent.save();
        return await this.getStudentBy_Id(newStudent._id);
    } //Создает и возвращает ученика
    async createClass(name, schoolName) {
        const School = await this.getSchoolByName(schoolName);
        if (School) {
            const newClass = new ClassModel_1.default({
                name: name.toUpperCase(),
                schoolName,
            });
            await School.updateOne({ $addToSet: { classes: newClass._id } });
            await newClass.save();
            return newClass;
        }
        else {
            return null;
        }
    } //Создает и возвращает класс
    async createSchool(name) {
        const School = new SchoolModel_1.default({ name });
        await School.save();
        return School;
    }
    //! Classes
    //* Homework
    async addHomework({ classNameOrInstance, schoolName }, lesson, content, studentVkId, expirationDate) {
        if (this.validateContent(content).length === 0) {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                if (Class.schedule.flat().includes(lesson)) {
                    let parsedContent = {
                        text: content.text,
                        attachments: content.attachments,
                    };
                    const newHomework = {
                        lesson,
                        _id: new mongoose_1.default.Types.ObjectId(),
                        createdBy: studentVkId,
                        to: new Date(),
                        pinned: false,
                        ...parsedContent,
                    };
                    if (expirationDate) {
                        if (this.validateDate(expirationDate, undefined, getTodayDate())) {
                            newHomework.to = expirationDate;
                            await Class.updateOne({
                                $push: { homework: newHomework },
                            });
                            return newHomework._id;
                        }
                        else {
                            throw new TypeError(`Expiration date must be Date in the future, got ${expirationDate}`);
                        }
                    }
                    else {
                        const nextLessonWeekDay = functions_1.findNextDayWithLesson(Class.schedule, lesson, new Date().getDay() || 7); // 1 - 7
                        const nextLessonDate = functions_1.findNextLessonDate(nextLessonWeekDay);
                        newHomework.to = nextLessonDate;
                        await Class.updateOne({
                            $push: { homework: newHomework },
                        });
                        return newHomework._id;
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        else {
            throw new Error(JSON.stringify(this.validateContent(content)));
        }
    } //Добавляет жомашнее задание в класс
    async removeHomework({ classNameOrInstance, schoolName }, homeworkId) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            await Class.updateOne({
                homework: Class.homework.filter((hw) => hw._id.toString() !== homeworkId),
            });
            return true;
        }
        else {
            return false;
        }
    }
    async getHomework({ classNameOrInstance, schoolName }, date) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            if (date) {
                return Class.homework.filter(({ to }) => functions_1.checkIsToday(date, to));
            }
            else {
                return Class.homework;
            }
        }
        else {
            return [];
        }
    } //
    async updateHomework({ classNameOrInstance, schoolName }, homeworkId, updates) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const updatedHomework = Class.homework.map((ch) => 
            //TODO test
            ch._id.toString() === homeworkId.toString() ? { ...ch, ...updates } : ch);
            await Class.updateOne({
                homework: updatedHomework,
            });
            return await this.getClassBy_Id(Class._id).then((cl) => cl?.homework || null);
        }
        else {
            return [];
        }
    }
    async getHomeworkByDate({ classNameOrInstance, schoolName }, date) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const { homework } = Class;
            return homework?.filter((hw) => Math.abs(hw.to.getTime() - date.getTime()) <= functions_1.dayInMilliseconds &&
                hw.to.getDate() === date.getDate());
        }
        else {
            return [];
        }
    }
    async removeOldHomework({ classNameOrInstance, schoolName }, maxDate = new Date()) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const { homework } = Class;
            const actualHomework = homework.filter(({ to }) => getPureDate(maxDate).getTime() - getPureDate(to).getTime() <= 0);
            await Class.updateOne({ homework: actualHomework });
            return actualHomework;
        }
        else {
            return [];
        }
    }
    async togglePinHomework({ classNameOrInstance, schoolName }, homeworkId) {
        try {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                const homework = await Class.homework.find(({ _id }) => _id.toString() === homeworkId.toString());
                if (homework) {
                    homework.pinned = !homework.pinned;
                    await Class.save();
                    return true;
                }
            }
            return false;
        }
        catch (e) {
            console.error(e);
            if (e instanceof TypeError)
                throw e;
            return false;
        }
    }
    async unpinAllHomework({ classNameOrInstance, schoolName }) {
        try {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                await Class.updateOne({ $set: { 'homework.$[].pinned': false } });
                return true;
            }
            return false;
        }
        catch (e) {
            console.error(e);
            if (e instanceof TypeError)
                throw e;
            return false;
        }
    }
    //TODO refactor returning data from array to object
    async parseHomeworkToNotifications(currentDateForTest) {
        const classes = await ClassModel_1.default.find({});
        const notificationArray = []; //Массив массивов типа [[Массив вк айди учеников], [Массив дз]]
        for (const cl of classes) {
            const populatedClass = await this.populate(cl);
            if (populatedClass.homework.length && populatedClass.students.length) {
                const date = currentDateForTest || Date();
                date.setDate(date.getDate() + 1); // Берем дз на некст день
                const notifiedStudentIds = functions_1.findNotifiedStudents(populatedClass.students, currentDateForTest || new Date(), 24 * 60 * 60 * 1000).map(({ vkId }) => vkId);
                const homework = populatedClass.homework.filter(({ to }) => functions_1.checkIsToday(to, date));
                notificationArray.push([notifiedStudentIds, homework]);
            }
        }
        return notificationArray;
    } //
    //* Schedule
    async setSchedule({ classNameOrInstance, schoolName }, newSchedule) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            await Class.updateOne({ schedule: newSchedule });
            return true;
        }
        else {
            return false;
        }
    }
    async changeDay({ classNameOrInstance, schoolName }, dayIndex, newLessonsForDay) {
        if (dayIndex <= 5 && dayIndex >= 0) {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                const schedule = [...Class.schedule];
                schedule[dayIndex] = newLessonsForDay;
                await Class.updateOne({ schedule });
                return schedule;
            }
            else {
                return false;
            }
        }
        else {
            throw new TypeError(`day index must be number less than 6 and greater than 0, got ${dayIndex}`);
        }
    }
    async getSchedule({ classNameOrInstance, schoolName }) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            return Class.schedule;
        }
        else {
            return [];
        }
    }
    //* Announcements
    async addAnnouncement({ classNameOrInstance, schoolName }, content, toDate = new Date(), toAll = false, vkId) {
        if (this.validateContent(content).length === 0) {
            if (this.validateDate(toDate, undefined, getTodayDate())) {
                let Class;
                if (typeof classNameOrInstance === 'string') {
                    Class = await this.getClassByName(classNameOrInstance, schoolName);
                }
                else {
                    Class = classNameOrInstance;
                }
                if (Class) {
                    let parsedContent = {
                        text: content.text,
                        attachments: content.attachments,
                    };
                    const newAnnouncement = {
                        to: toDate,
                        createdBy: vkId,
                        pinned: false,
                        _id: new mongoose_1.default.Types.ObjectId(),
                        ...parsedContent,
                    };
                    if (toAll) {
                        const classes = await ClassModel_1.default.find({});
                        for (const _class of classes) {
                            await _class.updateOne({
                                $push: { announcements: newAnnouncement },
                            });
                        }
                        return newAnnouncement._id;
                    }
                    else {
                        await Class.updateOne({
                            $push: { announcements: newAnnouncement },
                        });
                        return newAnnouncement._id;
                    }
                }
                else {
                    return null;
                }
            }
            else {
                throw new TypeError(`toDate must be date, got "${toDate}"`);
            }
        }
        else {
            throw new TypeError(JSON.stringify(this.validateContent(content)));
        }
    } //
    async getAnnouncements({ classNameOrInstance, schoolName }, date) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            if (date) {
                return Class.announcements.filter((ch) => functions_1.checkIsToday(ch.to, date));
            }
            else {
                return Class.announcements;
            }
        }
        else {
            return null;
        }
    } //
    async removeAnnouncement({ classNameOrInstance, schoolName }, announcementId) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const announcements = Class.announcements;
            const updatedChanges = announcements.filter((ch) => ch._id.toString() !== announcementId.toString());
            await Class.updateOne({ announcements: updatedChanges });
            return updatedChanges;
        }
        else {
            return null;
        }
    }
    async updateAnnouncement({ classNameOrInstance, schoolName }, announcementId, updates) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const updatedAnnouncements = Class.announcements.map((ch) => ch._id.toString() === announcementId.toString()
                ? //TODO test
                    { ...ch, ...updates }
                : ch);
            await Class.updateOne({ announcements: updatedAnnouncements });
            return updatedAnnouncements;
        }
        else {
            return [];
        }
    }
    async removeOldAnnouncements({ classNameOrInstance, schoolName }, maxDate = new Date()) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName);
        }
        else {
            Class = classNameOrInstance;
        }
        if (Class) {
            const { announcements } = Class;
            const actualAnnouncements = announcements.filter(({ to }) => getPureDate(maxDate).getTime() - getPureDate(to).getTime() <= 0);
            await Class.updateOne({ announcements: actualAnnouncements });
            return actualAnnouncements;
        }
        else {
            return [];
        }
    }
    async togglePinAnnouncement({ classNameOrInstance, schoolName }, announcementId) {
        try {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                const announcement = await Class.announcements.find(({ _id }) => _id === announcementId);
                if (announcement) {
                    announcement.pinned = !announcement.pinned;
                    await Class.save();
                    return true;
                }
            }
            return false;
        }
        catch (e) {
            console.error(e);
            if (e instanceof TypeError)
                throw e;
            return false;
        }
    }
    async unpinAllAnnouncements({ classNameOrInstance, schoolName }) {
        try {
            let Class;
            if (typeof classNameOrInstance === 'string') {
                Class = await this.getClassByName(classNameOrInstance, schoolName);
            }
            else {
                Class = classNameOrInstance;
            }
            if (Class) {
                await Class.updateOne({ $set: { 'announcements.$[].pinned': false } });
                return true;
            }
            return false;
        }
        catch (e) {
            console.error(e);
            if (e instanceof TypeError)
                throw e;
            return false;
        }
    }
    //! Students
    //* Settings
    async changeSettings(vkIdOrStudentInstance, diffObject) {
        let Student;
        if (typeof vkIdOrStudentInstance === 'number') {
            Student = await this.getStudentByVkId(vkIdOrStudentInstance);
        }
        else {
            Student = vkIdOrStudentInstance;
        }
        if (Student) {
            await Student.updateOne({ settings: { ...Student.settings, ...diffObject } });
            return true;
        }
        else {
            return false;
        }
    }
    async changeLastHomeworkCheckDate(vkIdOrStudentInstance, newCheckDate) {
        let Student;
        if (typeof vkIdOrStudentInstance === 'number') {
            Student = await this.getStudentByVkId(vkIdOrStudentInstance);
        }
        else {
            Student = vkIdOrStudentInstance;
        }
        if (Student) {
            await Student.updateOne({
                lastHomeworkCheck: newCheckDate,
            });
            return true;
        }
        else {
            return false;
        }
    }
    //* Roles utils
    async getRole(id) {
        try {
            let Student;
            if (typeof id === 'number') {
                Student = await StudentModel_1.default.findOne({ vkId: id });
            }
            else if (isObjectId(id)) {
                Student = await StudentModel_1.default.findById(id);
            }
            else {
                throw new TypeError(`Id must be a number or an objectId, got ${id}`);
            }
            if (Student) {
                return Student.role;
            }
            else {
                return null;
            }
        }
        catch (e) {
            if (e instanceof TypeError)
                throw e;
            console.error(e);
        }
    }
    async backStudentToInitialRole(vkIdOrStudentInstance) {
        let Student;
        if (typeof vkIdOrStudentInstance === 'number') {
            Student = await this.getStudentByVkId(vkIdOrStudentInstance);
        }
        else {
            Student = vkIdOrStudentInstance;
        }
        if (Student) {
            await Student.updateOne({ role: utils_1.Roles.student });
            return true;
        }
        else {
            return false;
        }
    } //Возвращает редактора к роли ученика
    //* Interactions
    async addStudentToClass(vkIdOrStudentInstance, classNameOrInstance, schoolName) {
        let Class;
        if (typeof classNameOrInstance === 'string') {
            Class = await this.getClassByName(classNameOrInstance, schoolName || '');
        }
        else {
            Class = classNameOrInstance;
        }
        let Student;
        if (typeof vkIdOrStudentInstance === 'number') {
            Student = await this.getStudentByVkId(vkIdOrStudentInstance);
        }
        else {
            Student = vkIdOrStudentInstance;
        }
        if (Class && Student) {
            await Class.updateOne({
                $addToSet: { students: Student._id },
            });
            await Student.updateOne({
                class: Class._id,
                role: Class.students.length === 0 && Student.role === utils_1.Roles.student
                    ? utils_1.Roles.contributor
                    : Student.role,
            });
            return true;
        }
        else {
            return false;
        }
    } //Добавляет ученика в класс
    async removeStudentFromClass(vkIdOrStudentInstance) {
        let PopulatedStudent = null;
        if (typeof vkIdOrStudentInstance === 'number') {
            const Student = await this.getStudentByVkId(vkIdOrStudentInstance);
            if (Student) {
                PopulatedStudent = await this.populate(Student);
            }
        }
        else if (isStudentPopulated(vkIdOrStudentInstance)) {
            PopulatedStudent = vkIdOrStudentInstance;
        }
        else {
            PopulatedStudent = await this.populate(vkIdOrStudentInstance);
        }
        if (PopulatedStudent) {
            const Class = PopulatedStudent.class;
            if (!Class)
                return true;
            await Class.updateOne({
                students: Class.students.filter((_id) => _id.toString() !== PopulatedStudent?._id.toString()),
            });
            await PopulatedStudent.updateOne({ class: null });
            return true;
        }
        else {
            return false;
        }
    } //Удаляет ученика из класса
    async changeClass(vkIdOrStudentInstance, newClassNameOrInstance, schoolName) {
        let PopulatedStudent;
        if (typeof vkIdOrStudentInstance === 'number') {
            const Student = await this.getStudentByVkId(vkIdOrStudentInstance);
            if (Student) {
                PopulatedStudent = await this.populate(Student);
            }
            else {
                PopulatedStudent = null;
            }
        }
        else if (isStudentPopulated(vkIdOrStudentInstance)) {
            PopulatedStudent = vkIdOrStudentInstance;
        }
        else {
            PopulatedStudent = await this.populate(vkIdOrStudentInstance);
        }
        let newClass;
        if (typeof newClassNameOrInstance === 'string') {
            newClass = await this.getClassByName(newClassNameOrInstance, schoolName || '');
        }
        else if (isClassPopulated(newClassNameOrInstance)) {
            newClass = newClassNameOrInstance;
        }
        else {
            newClass = newClassNameOrInstance;
        }
        if (PopulatedStudent !== null) {
            if (newClass !== null) {
                if (PopulatedStudent.class !== null && PopulatedStudent.class !== undefined) {
                    if (PopulatedStudent.class.name !== newClassNameOrInstance) {
                        const removed = await this.removeStudentFromClass(PopulatedStudent);
                        if (!removed) {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                }
                return await this.addStudentToClass(PopulatedStudent, newClass.name, schoolName);
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    } //Меняет класс ученика
    async populate(document) {
        if ('students' in document) {
            return await document.populate('students').execPopulate();
        }
        else if ('class' in document) {
            return await document.populate('class').execPopulate();
        }
        else if ('classes' in document) {
            return await document.populate('classes').execPopulate();
        }
        else {
            return document;
        }
    } //
    validateContent(content) {
        const errors = [];
        if (content.attachments.length > 0 &&
            (!Array.isArray(content.attachments) ||
                content.attachments.some((at) => !this.validateAttachment(at)))) {
            errors.push('Invalid attachments');
        }
        if (content.text !== undefined && content.text !== '' && typeof content.text !== 'string') {
            errors.push('Text must be a string');
        }
        return errors;
    } //
    validateAttachment(attachment) {
        return (attachment.hasOwnProperty('value') &&
            /[a-z]+-?\d+_-?\d+(_.+)?/.test(attachment.value) &&
            attachment.hasOwnProperty('url'));
    } //
    validateDate(date, maxDate, minDate = getTodayDate()) {
        let flag = undefined;
        if (date instanceof Date) {
            if (maxDate && maxDate instanceof Date) {
                flag = maxDate.getTime() - date.getTime() >= 0;
            }
            if (minDate && minDate instanceof Date) {
                flag = date.getTime() - minDate.getTime() >= 0;
            }
            return flag ?? true;
        }
        else if (typeof date === 'string') {
            if (Date.parse(date)) {
                return this.validateDate(new Date(Date.parse(date)), maxDate, minDate);
            }
            return false;
        }
        else if (typeof date === 'number') {
            return this.validateDate(new Date(date), maxDate, minDate);
        }
        return false;
    }
    connect(...args) {
        mongoose_1.default.connect(this.uri, ...args);
    }
}
exports.DataBase = DataBase;
module.exports.DataBase = DataBase;
function getTodayDate() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
//# sourceMappingURL=DataBase.js.map