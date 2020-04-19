// @ts-nocheck
const { Roles, Lessons } = require( "../Models/utils" );

const _Student = require( "../Models/StudentModel" );
const _Class = require( "../Models/ClassModel" );
const uuid4 = require( "uuid4" );
const {
    // isObjectId,
    findNextDayWithLesson,
    findNextLessonDate,
    findNotifiedStudents,
    lessonsIndexesToLessonsNames,
    checkIsToday
} = require( "./utils/functions" );
const mongoose = require( "mongoose" );
const config = require( "config" );

const isObjectId = id => {
    if ( typeof id === "object" && !Array.isArray( id ) && id !== null ) {
        return id.toString() !== "[object Object]";
    } else {
        return false
    }
};

//TODO Replace returns of false and null to errors or error codes
class DataBase {
    //! Getters
    static async getStudentByVkId ( vkId ) {
        try {
            if ( vkId !== undefined && typeof vkId === "number" ) {
                const Student = await _Student.findOne( { vkId } );
                if ( Student ) {
                    return Student;
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "VkId must be number" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return null;
        }
    }; //Возвращает ученика по его id из vk
    static async getStudentBy_Id ( _id ) {
        try {
            if ( typeof _id === "object" && isObjectId( _id ) ) _id = _id.toString();
            if ( _id && typeof _id === "string" ) {
                const Student = await _Student.findById( _id );
                if ( Student ) {
                    return Student;
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "_id must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return null;
        }
    }; //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))
    static async getClassByName ( name ) {
        try {
            if ( name && typeof name === "string" ) {
                const Class = await _Class.findOne( { name } );
                if ( Class ) {
                    return Class;
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "name must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return null;
        }
    }; //Возвращает класс по его имени
    static async getClassBy_Id ( _id ) {
        try {
            if ( typeof _id === "object" && isObjectId( _id ) ) _id = _id.toString();
            if ( _id && typeof _id === "string" ) {
                const Class = await _Class.findById( _id );
                if ( Class ) {
                    return Class;
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "_id must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return null;
        }
    }; //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))
    static async getAllContributors () {
        try {
            const contributors = await _Student.find( { role: Roles.contributor } );
            if ( contributors ) {
                return contributors;
            } else {
                return [];
            }
        } catch ( e ) {
            console.log( e )
            return [];
        }
    }; //Возвращает список всех редакторов

    //! Creators
    static async createStudent ( vkId, class_id ) {
        try {
            if ( vkId !== undefined ) {
                if ( typeof vkId === "number" ) {
                    let newStudent;
                    if ( class_id ) {
                        const Class = await this.getClassBy_Id( class_id );
                        newStudent = new _Student( { vkId, class: Class ? class_id : undefined } );
                        if ( Class ) {
                            await Class.updateOne( { students: [ ...Class.students, newStudent._id ] } );
                        }
                    } else {
                        newStudent = new _Student( { vkId } );
                    }
                    await newStudent.save();
                    return await DataBase.getStudentBy_Id( newStudent._id );
                } else {
                    throw new TypeError( "VkId must be number" );
                }
            } else {
                throw new TypeError( "Vkid parameter is required" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return null;
        }
    }; //Создает и возвращает ученика
    static async createClass ( name ) {
        try {
            if ( name ) {
                if ( typeof name === "string" ) {
                    const newClass = new _Class( {
                        name
                    } );
                    await newClass.save();
                    return await DataBase.getClassBy_Id( newClass._id );
                } else {
                    throw new TypeError( "name must be string" );
                }
            } else {
                throw new TypeError( "name parameter is required" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return null;
        }
    }; //Создает и возвращает класс

    //! Classes

    //* Homework
    static async addHomework ( className, studentVkId, lesson, task, expirationDate ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( studentVkId && typeof studentVkId === "number" ) {
                    if ( lesson && Lessons.includes( lesson ) ) {
                        if ( task.trim() && typeof task === "string" ) {
                            const Class = await this.getClassByName( className );
                            if ( Class ) {
                                if ( Class.schedule.flat().includes( lesson ) ) {
                                    const newHomework = {
                                        lesson,
                                        task,
                                        createdBy: studentVkId,
                                        _id: new mongoose.Types.ObjectId()
                                    };
                                    if ( expirationDate ) {
                                        if ( expirationDate instanceof Date && Date.now() - expirationDate.getTime() > 0 ) {
                                            newHomework.to = expirationDate;
                                            await Class.updateOne( { homework: Class.homework.concat( [ newHomework ] ) } );
                                            return newHomework._id;
                                        } else {
                                            throw new TypeError( "Expiration date must be Date in the future" );
                                        }
                                    } else {
                                        const nextLessonWeekDay = findNextDayWithLesson( Class.schedule, lesson, ( new Date() ).getDay() || 7 ); // 1 - 7
                                        const nextLessonDate = findNextLessonDate( nextLessonWeekDay );
                                        newHomework.to = nextLessonDate;
                                        await Class.updateOne( { homework: Class.homework.concat( [ newHomework ] ) } );
                                        return newHomework._id;
                                    }
                                } else {
                                    return null;
                                }
                            } else {
                                return null;
                            }
                        } else {
                            throw new TypeError( "Task must be non empty string" );
                        }
                    } else {
                        throw new TypeError( "Lesson must be in lessons list" );
                    }
                } else {
                    throw new TypeError( "Student vkId must by number" )
                }
            } else {
                throw new TypeError( "ClassName must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return null;
        }
    }; //Добавляет жомашнее задание в класс
    static async removeHomework ( className, homeworkId ) {
        try {
            if ( typeof homeworkId === "object" && isObjectId( homeworkId ) ) homeworkId = homeworkId.toString();
            if ( className && typeof className === "string" ) {
                if ( homeworkId && typeof homeworkId === "string" ) {
                    const Class = await this.getClassByName( className );
                    if ( Class ) {
                        await ( await Class ).updateOne( { homework: Class.homework.filter( hw => hw._id !== homeworkId ) } );
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    throw new TypeError( "homeworkId must be a string or objectId" )
                }
            } else {
                throw new TypeError( "className must be a string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return false;
        }
    }
    static async getHomework ( className, date ) {
        try {
            if ( className && typeof className === "string" ) {
                const Class = await this.getClassByName( className );
                if ( Class ) {
                    if ( date ) {
                        return Class.homework.filter( ( { to } ) => checkIsToday( date, to ) );
                    } else {
                        return Class.homework;
                    }
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return null
        }
    }; //
    //TODO refactor returning data from array to object
    static async parseHomeworkToNotifications ( currentDateForTest ) {
        const classes = await _Class.find( {} );
        const notificationArray = []; //Массив массивов типа [[Массив вк айди учеников], [Массив дз]]
        for ( const cl of classes ) {
            const populatedClass = await this.populate( cl );
            if ( populatedClass.homework.length && populatedClass.students.length ) {
                const date = currentDateForTest || Date();
                date.setDate( date.getDate() + 1 ); // Берем дз на некст день
                const notifiedStudentIds = findNotifiedStudents( populatedClass.students, currentDateForTest || new Date(), config.get( "REMIND_AFTER" ) ).map( ( { vkId } ) => vkId );
                const homework = populatedClass.homework.filter( ( { to } ) => checkIsToday( to, date ) );
                notificationArray.push( [ notifiedStudentIds, homework ] );
            }
        }
        return notificationArray;
    }; //

    //* Schedule
    static async setSchedule ( className, lessonsIndexesByDays, lessonList = Lessons ) {
        try {
            if ( className && typeof className === "string" ) {
                const Class = await this.getClassByName( className );
                if ( Class ) {
                    const newSchedule = lessonsIndexesToLessonsNames( lessonList, lessonsIndexesByDays );
                    await Class.updateOne( { schedule: newSchedule } );
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new TypeError( "ClassName must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return false;
        }
    }; //Устонавливает расписание (1: список предметов, 2: имя класса, 3: массив массивов индексов уроков где индекс соответствует уроку в массиве(1) по дням недели)
    static async changeDay ( className, dayIndex, newDay ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( dayIndex && typeof dayIndex === "number" && dayIndex < 6 && dayIndex >= 0 ) {
                    if ( newDay && Array.isArray( newDay ) && newDay.every( lesson => typeof lesson === "string" && Lessons.includes( lesson ) ) ) {
                        const Class = this.getClassByName( className );
                        if ( Class ) {
                            const schedule = { ...Class.schedule };
                            schedule[ index ] = newDay;
                            await Class.updateOne( { schedule } );
                            return schedule;
                        } else {
                            return false;
                        }
                    } else {
                        throw new TypeError( "new day must be array of lessons" );
                    }
                } else {
                    throw new TypeError( "day index must be number less than 6" )
                }
            } else {
                throw new TypeError( "Class name must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            return false;
        }
    }

    //*Changes
    static async addChanges ( vkId, content, toDate = new Date(), toAll = false ) {
        try {
            if ( vkId !== undefined && typeof vkId === 'number' ) {
                if ( this.validateChangeContent( content ) ) {
                    if ( toDate && toDate instanceof Date ) {
                        const Student = await this.populate( await this.getStudentByVkId( vkId ) );
                        const newChange = {
                            to: toDate,
                            createdBy: vkId,
                            ...content
                        };
                        if ( toAll ) {
                            const classes = await _Class.find( {} );
                            for ( const _class of classes ) {
                                await _class.updateOne( { changes: [ ..._class.changes, newChange ] } )
                            }
                            return true;
                        } else {
                            if ( Student.class ) {
                                await Student.class.updateOne( { changes: [ ...Student.class.changes, newChange ] } );
                                return true;
                            } else {
                                return false; //Не состоя в классе вы можете добавлять изменения только всем классам
                            }
                        }
                    } else {
                        throw new TypeError( "toDate must be date" );
                    }
                } else {
                    throw new TypeError( "Contents must be object with poles attachments and text" )
                }
            } else {
                throw new TypeError( "VkId must be number" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return false;
        }
    }; //

    static async getChanges ( className, date ) {
        try {
            if ( className && typeof className === "string" ) {
                const Class = await this.getClassByName( className );
                if ( Class ) {
                    if ( date ) {
                        return Class.changes.filter( ch => checkIsToday( ch.to, date ) )
                    } else {
                        return Class.changes;
                    }
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            return null;
        }
    }; //

    //! Students

    //* Settings
    static async changeSettings ( vkId, diffObject ) {
        try {
            if ( vkId !== undefined && typeof vkId === "number" ) {
                if ( typeof diffObject === "object" && diffObject !== null ) {
                    const Student = await this.getStudentByVkId( vkId );
                    if ( Student ) {
                        let settings = Student.settings;
                        for ( const key in diffObject ) {
                            if ( key in settings ) {
                                settings[ key ] = diffObject[ key ];
                            }
                        }
                        await Student.updateOne( { settings } );
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    throw new TypeError( "Second parameter must be an object of diffs in object" )
                }
            } else {
                throw new TypeError( "VkId must be type of number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return false;
        }
    };

    //* Roles utils
    static async generateNewRoleUpCode ( className ) {
        try {
            if ( className && typeof className === "string" ) {
                const newCode = uuid4();
                const Class = await DataBase.getClassByName( className );
                if ( Class ) {
                    Class.roleUpCodes.push( newCode );
                    await Class.save();
                    return newCode;
                } else {
                    return null;
                }
            } else {
                throw new TypeError( "className must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.error( e );
            return null
        }
    }; //Генерирует и возвращает код для того что бы стать радактором, если не получилось возвращает null
    static async removeRoleUpCode ( className, code ) {
        try {
            if ( uuid4.valid( code ) ) {
                const Class = await DataBase.getClassByName( className );
                if ( Class && Class.roleUpCodes ) {
                    Class.roleUpCodes = Class.roleUpCodes.filter( code => code !== code );
                    await Class.save();
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new TypeError( "Code to be removed must be valid uuid4 code" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            return false;
        }
    }; //Убирает код из списка кодов класса
    static async activateCode ( vkId, code ) {
        try {
            if ( vkId !== undefined && typeof vkId === "number" ) {
                let Student = await this.populate( await this.getStudentByVkId( vkId ) );
                if ( Student ) {
                    if ( Student.class ) {
                        const isValid = await this.checkCodeValidity( Student.class, code );

                        if ( isValid ) {
                            const removed = await this.removeRoleUpCode( Student.class.name, code );
                            if ( removed ) {
                                await Student.updateOne( { role: Roles.contributor } );
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        throw new TypeError( "Student must have class property to activate code" );
                    }
                } else {
                    return false;
                }
            } else {
                throw new TypeError( "VkId must be number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            return false;
        }
    }; //Активирует код - делает ученика редактором и убирает код и списка кодов класса
    static async checkCodeValidity ( classOrClassName, code ) {
        try {
            if ( classOrClassName && typeof classOrClassName === "string" ) {
                if ( uuid4.valid( code ) ) {
                    const Class = await this.getClassByName( classOrClassName );
                    if ( Class && Class.roleUpCodes ) {
                        return Class.roleUpCodes.includes( code );
                    } else {
                        return false;
                    }
                } else {
                    return false
                }
            } else {
                if ( classOrClassName instanceof mongoose.Document ) {
                    if ( classOrClassName.roleUpCodes ) {
                        if ( uuid4.valid( code ) ) {
                            return classOrClassName.roleUpCodes.includes( code );
                        } else {
                            return false;
                        }
                    }
                }
                throw new TypeError( "className must be a string or Document" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e }
            console.log( e )
            return false;
        }
    }; //Проверяет валидность кода - Правильного ли он формата и есть ли он в списке кодов класса
    static async backStudentToInitialRole ( vkId ) {
        try {
            if ( vkId !== undefined && typeof vkId === "number" ) {
                const Student = await this.getStudentByVkId( vkId );
                if ( Student ) {
                    await Student.updateOne( { role: Roles.student } )
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new TypeError( "VkId must be a number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.error( e );
            return false;
        }
    }; //Возвращает редактора к роли ученика
    //Status
    static async banUser ( vkId, isBan = true ) {
        try {
            if ( vkId !== undefined && typeof vkId === "number" ) {
                if ( typeof isBan === "boolean" ) {
                    const Student = await this.getStudentByVkId( vkId );
                    if ( Student ) {
                        await Student.updateOne( { banned: isBan } );
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    throw new TypeError( "isBan param must be boolean" )
                }
            } else {
                throw new TypeError( "VkId must be a number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return false;
        }
    }; //

    //* Interactions
    static async addStudentToClass ( StudentVkId, className ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                if ( newClassName && typeof newClassName === "string" ) {
                    const Class = await this.getClassByName( className );
                    const Student = await this.getStudentByVkId( StudentVkId );
                    if ( Class && Student ) {
                        await Class.updateOne( { students: [ ...Class.students, Student._id ] } );
                        await Student.updateOne( { class: Class._id } );
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    throw new TypeError( "newClassName must be string" )
                }
            } else {
                throw new TypeError( "Student vkId must be a number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return false;
        }
    }; //Добавляет ученика в класс
    static async removeStudentFromClass ( StudentVkId ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                const Student = await this.populate( await DataBase.getStudentByVkId( StudentVkId ) );
                if ( Student ) {
                    const Class = Student.class;
                    if ( !Class ) return true;
                    await Class.updateOne( { students: Class.students.filter( ( { _id } ) => _id.toString() !== Student._id.toString() ) } );
                    await Student.updateOne( { class: null } );
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new TypeError( "StudentVkId must be a number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e }
            console.error( e );
            return false;
        }
    }; //Удаляет ученика из класса
    static async changeClass ( StudentVkId, newClassName ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                if ( newClassName && typeof newClassName === "string" ) {
                    const Student = await this.populate( await this.getStudentByVkId( StudentVkId ) );
                    if ( Student.class.name !== newClassName ) {
                        const newClass = await this.getClassByName( newClassName );
                        if ( newClass && Student ) {
                            const removed = await this.removeStudentFromClass( StudentVkId );
                            if ( removed ) {
                                await Student.updateOne( { class: newClass._id } );
                                newClass.students.push( Student._id );
                                await newClass.save();
                                await Student.save();
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    throw new TypeError( "newClassName must be string" )
                }
            } else {
                throw new TypeError( "Student vkId must be a number" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e }
            console.log( e );
            return false;
        }
    }; //Меняет класс ученика

    //! Helpers
    static async populate ( document ) {
        try {
            if ( document instanceof mongoose.Document ) {
                if ( document.students ) {
                    return await document.populate( "students" ).execPopulate();
                } else if ( document.class ) {
                    return await document.populate( "class" ).execPopulate();
                } else {
                    return document
                }
            } else {
                if ( document === null ) {
                    return null;
                }
                throw new TypeError( "Argument must be a Document" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e; }
            console.log( e )
            return null;
        }
    } //
    static validateChangeContent ( content ) {
        if ( content ) {
            if ( content !== null && content.toString() === "[object Object]" ) {
                if ( Object.keys( content ).length > 0 && Object.keys( content ).length <= 2 && Object.keys( content ).every( key => [ "attachments", "text" ].includes( key ) ) ) {
                    if ( content.attachments && this.validateAttachment( content.attachments ) ) {
                        return false;
                    }
                    if ( content.text && typeof content.text !== "string" ) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };
        return false;
    } //
    static validateAttachment ( attachment ) {
        return typeof attachment !== "string" || !/[a-z]+\d+_\d+_.+/.test( attachment );
    } //
}

module.exports.DataBase = DataBase;

