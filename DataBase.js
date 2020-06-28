const { Roles, Lessons } = require( "./Models/utils" );
const _Student = require( "./Models/StudentModel" );
const _Class = require( "./Models/ClassModel" );
const uuid4 = require( "uuid4" );
const {
    findNextDayWithLesson,
    findNextLessonDate,
    findNotifiedStudents,
    lessonsIndexesToLessonsNames,
    checkIsToday,
} = require( "./utils/functions" );
const mongoose = require( "mongoose" );
const config = require( "config" );
const VK_API = require( "./VkAPI/VK_API" );
const isObjectId = mongoose.Types.ObjectId.isValid;

const isPartialOf = ( object, instance ) => {
    if ( Array.isArray( object ) ) return object.some( key => instance.hasOwnProperty( key ) );
    if ( typeof object === "object" ) return Object.keys( instance ).length !== 0 && Object.keys( object ).some( key => instance.hasOwnProperty( key ) );
    throw new TypeError( "object must be an object or an array of properties" );
}

const VK = new VK_API( config.get( "VK_API_KEY" ) );


//TODO Replace returns of false and null to errors or error codes
class DataBase {
    constructor( uri ) {
        if ( uri ) {
            this.uri = uri;
        } else {
            throw new Error( "You must pass an DataBase uri to constructor" )
        }
    }

    //! Getters
    async getStudentByVkId ( vkId ) {
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
    async getStudentBy_Id ( _id ) {
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
    async getClassByName ( name ) {
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
    async getClassBy_Id ( _id ) {
        try {
            if ( isObjectId( _id ) ) {
                if ( typeof _id === "object" ) _id = _id.toString();
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
            } else {
                throw new TypeError( "_id must be an objectId" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return null;
        }
    }; //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))
    async getAllContributors () {
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
    async getAllStudents () {
        try {
            return await _Student.find( {} ) || [];
        } catch ( e ) {
            console.error( e );
        }
    }
    async getAllClasses () {
        try {
            return await _Class.find( {} ) || [];
        } catch ( e ) {
            console.error( e );
        }
    }

    //! Creators
    async createStudent ( vkId, { class_id, firstName, lastName: secondName } = {} ) {
        try {
            if ( vkId !== undefined ) {
                if ( typeof vkId === "number" ) {
                    let newStudent;
                    let newStudentInfo = { vkId, firstName, secondName };
                    if ( class_id ) {
                        const Class = await this.getClassBy_Id( class_id );
                        if ( Class ) {
                            newStudentInfo.class = class_id;
                            await Class.updateOne( { students: [ ...Class.students, newStudent._id ] } );
                        }
                    }
                    newStudent = new _Student( newStudentInfo );
                    await newStudent.save();
                    return await this.getStudentBy_Id( newStudent._id );
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
    async createClass ( name ) {
        try {
            if ( name ) {
                if ( typeof name === "string" ) {
                    const newClass = new _Class( {
                        name
                    } );
                    await newClass.save();
                    return await this.getClassBy_Id( newClass._id );
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
    async addHomework ( className, lesson, content, studentVkId, expirationDate ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( lesson && Lessons.includes( lesson ) ) {
                    if ( this.validateContent( content ).length === 0 ) {
                        const Class = await this.getClassByName( className );
                        if ( Class ) {
                            if ( Class.schedule.flat().includes( lesson ) ) {
                                let parsedContent = {
                                    text: content.text || "",
                                    attachments: content.attachments
                                };
                                const newHomework = {
                                    lesson,
                                    ...parsedContent,
                                    _id: new mongoose.Types.ObjectId(),
                                    createdBy: studentVkId
                                };
                                if ( studentVkId ) {
                                    if ( studentVkId && typeof studentVkId === "number" ) {
                                        newHomework.createdBy = studentVkId
                                    } else {
                                        throw new TypeError( "if vkid is passed it must be a number" )
                                    }
                                };
                                if ( expirationDate ) {
                                    if ( this.validateDate( expirationDate, undefined, new Date(), 24 * 60 * 60 * 1000 ) ) {
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
                        throw new Error( JSON.stringify( this.validateContent( content ) ) );
                    }
                } else {
                    throw new TypeError( "Lesson must be in lessons list" );
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
    async removeHomework ( className, homeworkId ) {
        try {
            if ( typeof homeworkId === "object" && isObjectId( homeworkId ) ) homeworkId = homeworkId.toString();
            if ( className && typeof className === "string" ) {
                if ( homeworkId && typeof homeworkId === "string" ) {
                    const Class = await this.getClassByName( className );
                    if ( Class ) {
                        await Class.updateOne( { homework: Class.homework.filter( hw => hw._id.toString() !== homeworkId ) } );
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
    async getHomework ( className, date ) {
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
                    return [];
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return []
        }
    }; //
    async updateHomework ( className, homeworkId, updates ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( homeworkId && isObjectId( homeworkId ) ) {
                    if ( isPartialOf( [ "attachments", "text", "lesson", "to", "createdBy", "_id", "album_id" ], updates ) ) {
                        const Class = await this.getClassByName( className );
                        if ( Class ) {
                            const updatedHomework = Class.homework.map( ch => ch._id.toString() === homeworkId.toString() ? { ...ch.toObject(), ...updates } : ch );

                            await Class.updateOne( { homework: updatedHomework } );

                            return await this.getClassBy_Id( Class._id ).then( cl => cl.homework );
                        } else {
                            return [];
                        }
                    } else {
                        throw new TypeError( "updates must be object containing poles of homework" )
                    }
                } else {
                    throw new TypeError( "HomeworkId must be objectId" )
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return null;
        }
    }
    async getHomeworkByDate ( classNameOrInstance, date ) {
        try {
            if ( classNameOrInstance && ( typeof classNameOrInstance === "string" || ( typeof classNameOrInstance === "object" && classNameOrInstance.homework instanceof Array && classNameOrInstance.homework[ 0 ].lesson ) ) ) {
                if ( date && date instanceof Date ) {
                    let Class;
                    if ( typeof classNameOrInstance === "string" ) {
                        Class = await this.getClassByName( classNameOrInstance );
                    }

                    if ( Class ) {
                        const { homework } = Class;
                        return homework?.filter(
                            hw => ( Math.abs( hw.to.getTime() - date.getTime() ) <= dayInMilliseconds ) && hw.to.getDate() === date.getDate()
                        );
                    } else {
                        return [];
                    }
                } else {
                    throw new TypeError( "Date must be instance of Date" )
                }
            } else {
                throw new TypeError( "ClassName must be string or Class instance" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e }
            console.error( e );
        }
    }

    //TODO refactor returning data from array to object
    async parseHomeworkToNotifications ( currentDateForTest ) {
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
    async setSchedule ( className, lessonsIndexesByDays, lessonList = Lessons ) {
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
    //TODO refactor change schedule scene with it | 
    async changeDay ( className, dayIndex, newDay ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( dayIndex !== undefined && typeof dayIndex === "number" && dayIndex <= 5 && dayIndex >= 0 ) {
                    if ( newDay && Array.isArray( newDay ) && newDay.every( lesson => typeof lesson === "string" && Lessons.includes( lesson ) ) ) {
                        const Class = await this.getClassByName( className );
                        if ( Class ) {
                            const schedule = [ ...Class.schedule ];
                            schedule[ dayIndex ] = newDay;
                            await Class.updateOne( { schedule } );
                            return schedule;
                        } else {
                            return false;
                        }
                    } else {
                        throw new TypeError( "new day must be array of lessons but you pass: " + newDay.filter( l => !Lessons.includes( l ) ).join( "," ) );
                    }
                } else {
                    throw new TypeError( "day index must be number less than 6 and greater than 0" )
                }
            } else {
                throw new TypeError( "Class name must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e );
            return false;
        }
    }
    async getSchedule ( className ) {
        try {
            if ( className && typeof className === "string" ) {
                const Class = await this.getClassByName( className );
                if ( Class ) {
                    return Class.schedule;
                } else {
                    return [];
                }
            } else {
                throw new TypeError( "Class name must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return [];
        }
    }

    //*Changes
    async addChanges ( className, content, toDate = new Date(), toAll = false, vkId ) {
        try {
            if ( className !== undefined && typeof className === 'string' ) {
                if ( this.validateContent( content ).length === 0 ) {
                    if ( this.validateDate( toDate ) ) {
                        const Class = await this.getClassByName( className );
                        if ( Class ) {
                            let parsedContent = {
                                text: content.text || "",
                                attachments: content.attachments
                            };
                            const newChange = {
                                to: toDate,
                                ...parsedContent,
                                _id: new mongoose.Types.ObjectId()
                            };
                            if ( toAll ) {
                                const classes = await _Class.find( {} );
                                for ( const _class of classes ) {
                                    await _class.updateOne( { changes: [ ..._class.changes, newChange ] } )
                                }
                                return newChange._id;
                            } else {
                                if ( vkId ) {
                                    newChange.createdBy = vkId
                                }
                                await Class.updateOne( { changes: [ ...Class.changes, newChange ] } );
                                return newChange._id;
                            }
                        } else {
                            return null;
                        }
                    } else {
                        throw new TypeError( "toDate must be date" );
                    }
                } else {
                    throw new TypeError( JSON.stringify( this.validateContent( content ) ) )
                }
            } else {
                throw new TypeError( "ClassName must be string" );
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.log( e )
            return false;
        }
    }; //

    async getChanges ( className, date ) {
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

    async removeChanges ( className, changeId ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( changeId && isObjectId( changeId ) ) {
                    const Class = await this.getClassByName( className );
                    if ( Class ) {
                        const changes = Class.changes;
                        const updatedChanges = changes.filter( ch => ch._id.toString() !== changeId.toString() );

                        await Class.updateOne( { changes: updatedChanges } );

                        return updatedChanges;
                    } else {
                        return null;
                    }
                } else {
                    throw new TypeError( "ChangeId must be objectId" )
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return null;
        }
    }

    async updateChange ( className, changeId, updates ) {
        try {
            if ( className && typeof className === "string" ) {
                if ( changeId && isObjectId( changeId ) ) {
                    if ( isPartialOf( [ "attachments", "text", "to" ], updates ) ) {
                        const Class = await this.getClassByName( className );
                        if ( Class ) {
                            const updatedChanges = Class.changes.map( ch => ch._id.toString() === changeId.toString() ? { ...ch.toObject(), ...updates } : ch );

                            await Class.updateOne( { changes: updatedChanges } );

                            return updatedChanges;
                        } else {
                            return [];
                        }
                    } else {
                        throw new TypeError( "updates must be object containing poles of change" )
                    }
                } else {
                    throw new TypeError( "ChangeId must be objectId" )
                }
            } else {
                throw new TypeError( "ClassName must be string" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e };
            console.log( e );
            return null;
        }
    }

    //! Students

    //* Settings
    async changeSettings ( vkId, diffObject ) {
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
    async getRole ( id ) {
        try {
            let Student;

            if ( typeof id === "number" ) {
                Student = await _Student.findOne( { vkId: id } );
            } else if ( isObjectId( id ) ) {
                Student = await _Student.findById( id );
            } else {
                throw new TypeError( "Id must be a number or an objectId" );
            }

            if ( Student ) {
                return Student.role;
            } else {
                return null;
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) throw e;
            console.error( e );
        }
    }
    async generateNewRoleUpCode ( className ) {
        try {
            if ( className && typeof className === "string" ) {
                const newCode = uuid4();
                const Class = await this.getClassByName( className );
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
    async removeRoleUpCode ( className, code ) {
        try {
            if ( uuid4.valid( code ) ) {
                const Class = await this.getClassByName( className );
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
    async activateCode ( vkId, code ) {
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
    async checkCodeValidity ( classOrClassName, code ) {
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
            } else if ( classOrClassName instanceof mongoose.Document && classOrClassName.roleUpCodes !== undefined ) {
                if ( uuid4.valid( code ) ) {
                    return classOrClassName.roleUpCodes.includes( code );
                } else {
                    return false;
                }
            } else {
                console.log( "awdakufbnAJKFGGNE" )
                throw new TypeError( "className must be a string or Document" )
            }
        } catch ( e ) {
            if ( e instanceof TypeError ) { throw e }
            console.log( e )
            return false;
        }
    }; //Проверяет валидность кода - Правильного ли он формата и есть ли он в списке кодов класса
    async backStudentToInitialRole ( vkId ) {
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
    async banUser ( vkId, isBan = true ) {
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
    async addStudentToClass ( StudentVkId, className ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                if ( className && typeof className === "string" ) {
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
    async removeStudentFromClass ( StudentVkId ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                const Student = await this.populate( await this.getStudentByVkId( StudentVkId ) );
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
    async changeClass ( StudentVkId, newClassName ) {
        try {
            if ( StudentVkId !== undefined && typeof StudentVkId === "number" ) {
                if ( newClassName && typeof newClassName === "string" ) {
                    const Student = await this.populate( await this.getStudentByVkId( StudentVkId ) );
                    const newClass = await this.getClassByName( newClassName );
                    if ( Student !== null ) {
                        if ( newClass !== null ) {
                            if ( Student.class !== null ) {
                                if ( Student.class.name !== newClassName ) {
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
                                await Student.updateOne( { class: newClass._id } );
                                newClass.students.push( Student._id );
                                await newClass.save();
                                await Student.save();
                                return true;
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
    async populate ( document ) {
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
    validateContent ( content ) {
        const errors = [];
        if ( content ) {
            if ( content !== null && content.toString() === "[object Object]" ) {
                if (
                    Object.keys( content ).length > 0 &&
                    Object.keys( content ).length <= 2 &&
                    Object.keys( content ).every( key => [ "attachments", "text" ].includes( key ) )
                ) {
                    if ( content.attachments.length > 0 && ( !Array.isArray( content.attachments ) || content.attachments.some( at => !this.validateAttachment( at ) ) ) ) {
                        errors.push( "Invalid attachments" )
                    }
                    if ( content.text !== undefined && content.text !== "" && typeof content.text !== "string" ) {
                        errors.push( "Text must be a string" )
                    }
                } else {
                    errors.push( "Invalid content structure" )
                }
            } else {
                errors.push( "Content must be an object" );
            }
        } else {
            errors.push( "Content can't be undefined" );
        }
        return errors;
    } //
    validateAttachment ( attachment ) {
        if ( typeof attachment === "object" ) {
            return attachment.hasOwnProperty( "value" ) &&
                /[a-z]+-?\d+_-?\d+(_.+)?/.test( attachment.value ) &&
                attachment.hasOwnProperty( "url" )
        };
    } //
    validateDate ( date, maxDate, minDate = new Date(), d = 0 ) {
        let flag = true;
        if ( date instanceof Date ) {
            if ( maxDate && maxDate instanceof Date ) {
                flag = Math.abs( maxDate.getTime() - date.getTime() ) >= d;
                if ( !flag ) return flag;
            }
            if ( minDate && minDate instanceof Date ) {
                flag = Math.abs( date.getTime() - minDate.getTime() ) >= d;
                if ( !flag ) return flag;
            }
            return true;
        } else if ( typeof date === "string" ) {
            if ( Date.parse( date ) ) {
                return this.validateDate( new Date( Date.parse( date ) ), maxDate, minDate )
            }
            return false;
        } else if ( typeof date === "number" ) {
            return this.validateDate( new Date( date ), maxDate, minDate );
        } else {
            return false;
        }
    }

    connect ( ...args ) {
        mongoose.connect( this.uri, ...args );
    }
}

module.exports.DataBase = DataBase;

