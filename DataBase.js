const { Roles, Lessons } = require('./Models/utils');
const _Student = require('./Models/StudentModel');
const _School = require('./Models/SchoolModel');
const _Class = require('./Models/ClassModel');
const {
	findNextDayWithLesson,
	findNextLessonDate,
	findNotifiedStudents,
	lessonsIndexesToLessonsNames,
	checkIsToday,
	dayInMilliseconds,
} = require('./utils/functions');
const mongoose = require('mongoose');
const isObjectId = mongoose.Types.ObjectId.isValid;

const isPartialOf = (object, instance) => {
	if (typeof instance === 'object' && !Array.isArray(instance)) {
		if (Array.isArray(object)) {
			return object.some((key) => instance.hasOwnProperty(key));
		} else if (typeof object === 'object') {
			return (
				Object.keys(instance).length !== 0 &&
				Object.keys(object).some((key) => instance.hasOwnProperty(key))
			);
		} else {
			throw new TypeError(
				`object must be an object or an array of properties, got: ${object}`,
			);
		}
	} else {
		throw new TypeError(`Instance must be an array, got: ${instance}`);
	}
};

const getPureDate = (date) => {
	if (date && date instanceof Date) {
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();

		return new Date(year, month, day);
	} else {
		throw new Error('Ожидалась дата, дано: ' + JSON.stringify(date));
	}
};

//TODO Replace returns of false and null to errors or error codes
class DataBase {
	constructor(uri) {
		if (uri) {
			this.uri = uri;
		} else {
			throw new Error('You must pass an DataBase uri to constructor');
		}
	}

	//! Getters
	async getSchoolByName(schoolName) {
		try {
			return await _School.findOne({ name: schoolName });
		} catch (e) {
			console.error(e);
		}
	}
	async getSchoolBy_Id(_id) {
		try {
			return await _School.findById(_id);
		} catch (e) {
			console.error(e);
		}
	}

	async getStudentByVkId(vkId) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				const Student = await _Student.findOne({ vkId });
				if (Student) {
					return Student;
				} else {
					return null;
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Возвращает ученика по его id из vk
	async getStudentBy_Id(_id) {
		try {
			if (typeof _id === 'object' && isObjectId(_id)) _id = _id.toString();
			if (_id && typeof _id === 'string') {
				const Student = await _Student.findById(_id);
				if (Student) {
					return Student;
				} else {
					return null;
				}
			} else {
				throw new TypeError(`_id must be string, got ${_id}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))

	async getClassByName(name, schoolName) {
		try {
			if (name && typeof name === 'string') {
				const Class = await _Class.findOne({ name, schoolName });
				if (Class) {
					return Class;
				} else {
					return null;
				}
			} else {
				throw new TypeError(`name must be string, got ${name}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Возвращает класс по его имени
	async getClassBy_Id(_id) {
		try {
			if (isObjectId(_id)) {
				if (typeof _id === 'object') _id = _id.toString();
				if (_id && typeof _id === 'string') {
					const Class = await _Class.findById(_id);
					if (Class) {
						return Class;
					} else {
						return null;
					}
				} else {
					throw new TypeError(`_id must be a string, got ${_id}`);
				}
			} else {
				throw new TypeError(`_id must be valid objectId, got ${_id}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))

	async getAllContributors(schoolName) {
		try {
			let classes;
			if (schoolName) {
				classes = await this.getClassesForSchool(schoolName);
			} else {
				classes = await this.getAllClasses();
			}

			return Promise.all(
				classes
					.reduce((acc, c) => acc.concat(c.students), [])
					.filter(({ role }) => Roles.contributor === role)
					.map((studentId) => this.getStudentBy_Id(studentId)),
			);
		} catch (e) {
			console.error(e);
		}
	} //Возвращает список всех редакторов

	async getAllStudents(schoolName) {
		try {
			let classes;
			if (schoolName) {
				classes = await this.getClassesForSchool(schoolName);
			} else {
				return await _Student.find({});
			}

			return Promise.all(
				classes
					.reduce((acc, c) => acc.concat(c.students), [])
					.map((studentId) => this.getStudentBy_Id(studentId)),
			);
		} catch (e) {
			console.error(e);
		}
	}
	async getAllClasses(schoolName) {
		try {
			return (await _Class.find(!schoolName ? {} : { schoolName })) || [];
		} catch (e) {
			console.error(e);
		}
	}
	async getAllSchools() {
		try {
			return await _School.find({});
		} catch (e) {
			console.error(e);
		}
	}

	async getStudentsCount(className, schoolName) {
		try {
			if (typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);

				if (Class) {
					const Students = await _Student.find({ class: Class._id });

					return Students.length;
				} else {
					return 0;
				}
			} else {
				throw new TypeError(`ClassName must be a string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			return 0;
		}
	}
	async getStudentsFromClass(className, schoolName) {
		try {
			const { students } = await this.populate(
				await this.getClassByName(className, schoolName),
			);

			return students.map(({ vkId }) => vkId);
		} catch (e) {
			console.error(e);
		}
	}
	async getClassesForSchool(schoolName) {
		try {
			return _Class.find({ schoolName });
		} catch (e) {
			console.error(e);
		}
	}
	async getStudentsForSchool(schoolName) {
		try {
			const Classes = await this.getClassesForSchool(schoolName);

			if (Classes) {
				const PopulatedClassesPromises = Classes.map((Class) => this.populate(Class));

				const schoolStudents = [];

				for await (const { students: classStudents } of PopulatedClassesPromises) {
					schoolStudents.push(...classStudents);
				}

				return schoolStudents;
			}

			return [];
		} catch (e) {
			console.error(e);
		}
	}
	async getSchoolsForCity(cityName) {
		try {
			const Schools = await _School.find({
				name: { $regex: new RegExp(`^${cityName}:`) },
			});
			return Schools || [];
		} catch (e) {
			console.error(e);
		}
	}
	async getSchoolForStudent(vkId) {
		try {
			const { class: Class } = await this.populate(await this.getStudentByVkId(vkId));

			if (Class) {
				return await this.getSchoolByName(Class.schoolName);
			} else {
				return null;
			}
		} catch (e) {
			console.error(e);
		}
	}

	//! Creators
	async createStudent(
		vkId,
		{
			class_id = null,
			firstName = undefined,
			lastName: secondName = undefined,
			registered = false,
			schoolName,
		},
	) {
		try {
			if (vkId !== undefined) {
				if (typeof vkId === 'number') {
					let newStudentInfo = { vkId, firstName, secondName, registered };
					const newStudent = new _Student(newStudentInfo);
					if (class_id) {
						const Class = await this.getClassBy_Id(class_id);
						if (Class) {
							await Class.updateOne({
								students: [...Class.students, newStudent._id],
							});
							await newStudent.updateOne({
								class: Class._id,
								role:
									Class.students.length === 0
										? Roles.contributor
										: newStudent.role,
							});
						}
					}
					await newStudent.save();
					return await this.getStudentBy_Id(newStudent._id);
				} else {
					throw new TypeError(`VkId must be type of number, got ${vkId}`);
				}
			} else {
				throw new TypeError('Vkid parameter is required');
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Создает и возвращает ученика
	async createClass(name, schoolName) {
		try {
			if (name) {
				if (typeof name === 'string') {
					const School = await this.getSchoolByName(schoolName);

					if (School) {
						const newClass = new _Class({
							name: name.toUpperCase(),
							schoolName,
						});
						await School.updateOne({ $addToSet: { classes: newClass._id } });
						await newClass.save();
						return newClass;
					} else {
						return null;
					}
				} else {
					throw new TypeError(`name must be string, got ${name}`);
				}
			} else {
				throw new TypeError('name parameter is required');
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Создает и возвращает класс
	async createSchool(name) {
		try {
			const School = new _School({ name });

			await School.save();
			return School;
		} catch (e) {
			console.error(e);
		}
	}

	//! Classes

	//* Homework
	async addHomework({ className, schoolName }, lesson, content, studentVkId, expirationDate) {
		try {
			if (className && typeof className === 'string') {
				if (lesson && Lessons.includes(lesson)) {
					if (this.validateContent(content).length === 0) {
						const Class = await this.getClassByName(className, schoolName);
						if (Class) {
							if (Class.schedule.flat().includes(lesson)) {
								let parsedContent = {
									text: content.text || '',
									attachments: content.attachments,
								};
								const newHomework = {
									lesson,
									...parsedContent,
									_id: new mongoose.Types.ObjectId(),
									createdBy: studentVkId,
								};
								if (studentVkId) {
									if (studentVkId && typeof studentVkId === 'number') {
										newHomework.createdBy = studentVkId;
									} else {
										throw new TypeError(
											`if vkid is passed it must be a number, got ${studentVkId}`,
										);
									}
								}
								if (expirationDate) {
									const date = new Date();

									if (
										this.validateDate(
											expirationDate,
											undefined,
											new Date(
												date.getFullYear(),
												date.getMonth(),
												date.getDate(),
											),
											24 * 60 * 60 * 1000,
										)
									) {
										newHomework.to = expirationDate;
										await Class.updateOne({
											homework: Class.homework.concat([newHomework]),
										});
										return newHomework._id;
									} else {
										throw new TypeError(
											`Expiration date must be Date in the future, got ${expirationDate}`,
										);
									}
								} else {
									const nextLessonWeekDay = findNextDayWithLesson(
										Class.schedule,
										lesson,
										new Date().getDay() || 7,
									); // 1 - 7
									const nextLessonDate = findNextLessonDate(nextLessonWeekDay);
									newHomework.to = nextLessonDate;
									await Class.updateOne({
										homework: Class.homework.concat([newHomework]),
									});
									return newHomework._id;
								}
							} else {
								return null;
							}
						} else {
							return null;
						}
					} else {
						throw new Error(JSON.stringify(this.validateContent(content)));
					}
				} else {
					throw new TypeError(
						`Lesson must be in lessons list, got ${lesson}, but lessons list is ${JSON.stringify(
							Lessons,
							null,
							2,
						)}`,
					);
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return null;
		}
	} //Добавляет жомашнее задание в класс
	async removeHomework({ className, schoolName }, homeworkId) {
		try {
			if (typeof homeworkId === 'object' && isObjectId(homeworkId))
				homeworkId = homeworkId.toString();
			if (className && typeof className === 'string') {
				if (homeworkId && typeof homeworkId === 'string') {
					const Class = await this.getClassByName(className, schoolName);
					if (Class) {
						await Class.updateOne({
							homework: Class.homework.filter(
								(hw) => hw._id.toString() !== homeworkId,
							),
						});
						return true;
					} else {
						return false;
					}
				} else {
					throw new TypeError(
						`homeworkId must be a string or objectId, got "${homeworkId}"`,
					);
				}
			} else {
				throw new TypeError(`className must be a string, got "${className}"`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return false;
		}
	}
	async getHomework({ className, schoolName }, date) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);
				if (Class) {
					if (date) {
						return Class.homework.filter(({ to }) => checkIsToday(date, to));
					} else {
						return Class.homework;
					}
				} else {
					return [];
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return [];
		}
	} //
	async updateHomework({ className, schoolName }, homeworkId, updates) {
		try {
			if (className && typeof className === 'string') {
				if (homeworkId && isObjectId(homeworkId)) {
					if (
						isPartialOf(
							['attachments', 'text', 'lesson', 'to', 'createdBy', '_id', 'album_id'],
							updates,
						)
					) {
						const Class = await this.getClassByName(className, schoolName);
						if (Class) {
							const updatedHomework = Class.homework.map((ch) =>
								ch._id.toString() === homeworkId.toString()
									? { ...ch.toObject(), ...updates }
									: ch,
							);

							await Class.updateOne({
								homework: updatedHomework,
							});

							return await this.getClassBy_Id(Class._id).then((cl) => cl.homework);
						} else {
							return [];
						}
					} else {
						throw new TypeError(
							`updates must be object containing poles of homework, got ${updates}`,
						);
					}
				} else {
					throw new TypeError(`HomeworkId must be objectId, got ${updates}`);
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return null;
		}
	}
	async getHomeworkByDate({ classNameOrInstance, schoolName }, date) {
		try {
			if (
				classNameOrInstance &&
				(typeof classNameOrInstance === 'string' ||
					(typeof classNameOrInstance === 'object' &&
						classNameOrInstance.homework instanceof Array))
			) {
				if (date && date instanceof Date) {
					let Class;
					if (typeof classNameOrInstance === 'string') {
						Class = await this.getClassByName(classNameOrInstance, schoolName);
					} else {
						Class = classNameOrInstance;
					}

					if (Class) {
						const { homework } = Class;
						return homework?.filter(
							(hw) =>
								Math.abs(hw.to.getTime() - date.getTime()) <= dayInMilliseconds &&
								hw.to.getDate() === date.getDate(),
						);
					} else {
						return [];
					}
				} else {
					throw new TypeError(`date must be instance of Date, got ${date}`);
				}
			} else {
				throw new TypeError(
					`classNameOrInstance must be string or Class instance, got ${classNameOrInstance}`,
				);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.error(e);
		}
	}
	async removeOldHomework({ className, schoolName }, maxDate = new Date()) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);

				if (Class) {
					const { homework } = Class;

					const actualHomework = homework.filter(
						({ to }) => getPureDate(maxDate).getTime() - getPureDate(to).getTime() <= 0,
					);

					await Class.updateOne({ homework: actualHomework });

					return actualHomework;
				} else {
					return [];
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				console.error(e);
				return [];
			}
			throw e;
		}
	}

	//TODO refactor returning data from array to object
	async parseHomeworkToNotifications(currentDateForTest) {
		const classes = await _Class.find({});
		const notificationArray = []; //Массив массивов типа [[Массив вк айди учеников], [Массив дз]]
		for (const cl of classes) {
			const populatedClass = await this.populate(cl);
			if (populatedClass.homework.length && populatedClass.students.length) {
				const date = currentDateForTest || Date();
				date.setDate(date.getDate() + 1); // Берем дз на некст день
				const notifiedStudentIds = findNotifiedStudents(
					populatedClass.students,
					currentDateForTest || new Date(),
					24 * 60 * 60 * 1000,
				).map(({ vkId }) => vkId);
				const homework = populatedClass.homework.filter(({ to }) => checkIsToday(to, date));
				notificationArray.push([notifiedStudentIds, homework]);
			}
		}
		return notificationArray;
	} //

	//* Schedule
	async setSchedule({ className, schoolName }, lessonsIndexesByDays, lessonList = Lessons) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);
				if (Class) {
					const newSchedule = lessonsIndexesToLessonsNames(
						lessonList,
						lessonsIndexesByDays,
					);
					await Class.updateOne({ schedule: newSchedule });
					return true;
				} else {
					return false;
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return false;
		}
	} //Устонавливает расписание (1: список предметов, 2: имя класса, 3: массив массивов индексов уроков где индекс соответствует уроку в массиве(1) по дням недели)

	async changeDay({ className, schoolName }, dayIndex, newDay) {
		try {
			if (className && typeof className === 'string') {
				if (
					dayIndex !== undefined &&
					typeof dayIndex === 'number' &&
					dayIndex <= 5 &&
					dayIndex >= 0
				) {
					if (
						newDay &&
						Array.isArray(newDay) &&
						newDay.every(
							(lesson) => typeof lesson === 'string' && Lessons.includes(lesson),
						)
					) {
						const Class = await this.getClassByName(className, schoolName);
						if (Class) {
							const schedule = [...Class.schedule];
							schedule[dayIndex] = newDay;
							await Class.updateOne({ schedule });
							return schedule;
						} else {
							return false;
						}
					} else {
						throw new TypeError(
							'new day must be array of lessons, but your day includes ' +
								newDay.filter((l) => !Lessons.includes(l)).join(','),
						);
					}
				} else {
					throw new TypeError(
						`day index must be number less than 6 and greater than 0, got ${dayIndex}`,
					);
				}
			} else {
				throw new TypeError(`className must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return false;
		}
	}
	async getSchedule({ className, schoolName }) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);
				if (Class) {
					return Class.schedule;
				} else {
					return [];
				}
			} else {
				throw new TypeError(`className must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return [];
		}
	}

	//* Announcements
	async addAnnouncement(
		{ className, schoolName },
		content,
		toDate = new Date(),
		toAll = false,
		vkId,
	) {
		try {
			if (className !== undefined && typeof className === 'string') {
				if (this.validateContent(content).length === 0) {
					if (this.validateDate(toDate)) {
						const Class = await this.getClassByName(className, schoolName);
						if (Class) {
							let parsedContent = {
								text: content.text || '',
								attachments: content.attachments,
							};
							const newAnnouncement = {
								to: toDate,
								...parsedContent,
								_id: new mongoose.Types.ObjectId(),
							};
							if (toAll) {
								const classes = await _Class.find({});
								for (const _class of classes) {
									await _class.updateOne({
										announcements: [..._class.announcements, newAnnouncement],
									});
								}
								return newAnnouncement._id;
							} else {
								if (vkId) {
									newAnnouncement.createdBy = vkId;
								}
								await Class.updateOne({
									announcements: [...Class.announcements, newAnnouncement],
								});
								return newAnnouncement._id;
							}
						} else {
							return null;
						}
					} else {
						throw new TypeError(`toDate must be date, got "${toDate}"`);
					}
				} else {
					throw new TypeError(JSON.stringify(this.validateContent(content)));
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return false;
		}
	} //

	async getAnnouncements({ className, schoolName }, date) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);
				if (Class) {
					if (date) {
						return Class.announcements.filter((ch) => checkIsToday(ch.to, date));
					} else {
						return Class.announcements;
					}
				} else {
					return null;
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			return null;
		}
	} //

	async removeAnnouncement({ className, schoolName }, announcementId) {
		try {
			if (className && typeof className === 'string') {
				if (announcementId && isObjectId(announcementId)) {
					const Class = await this.getClassByName(className, schoolName);
					if (Class) {
						const announcements = Class.announcements;
						const updatedChanges = announcements.filter(
							(ch) => ch._id.toString() !== announcementId.toString(),
						);

						await Class.updateOne({ announcements: updatedChanges });

						return updatedChanges;
					} else {
						return null;
					}
				} else {
					throw new TypeError(`announcementId must be objectId, got ${announcementId}`);
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return null;
		}
	}

	async updateAnnouncement({ className, schoolName }, announcementId, updates) {
		try {
			if (className && typeof className === 'string') {
				if (announcementId && isObjectId(announcementId)) {
					if (isPartialOf(['attachments', 'text', 'to'], updates)) {
						const Class = await this.getClassByName(className, schoolName);
						if (Class) {
							const updatedAnnouncements = Class.announcements.map((ch) =>
								ch._id.toString() === announcementId.toString()
									? { ...ch.toObject(), ...updates }
									: ch,
							);

							await Class.updateOne({ announcements: updatedAnnouncements });

							return updatedAnnouncements;
						} else {
							return [];
						}
					} else {
						throw new TypeError(
							`updates must be object containing poles of change, got ${updates}`,
						);
					}
				} else {
					throw new TypeError(`announcementId must be objectId, got ${announcementId}`);
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return null;
		}
	}

	async removeOldAnnouncements({ className, schoolName }, maxDate = new Date()) {
		try {
			if (className && typeof className === 'string') {
				const Class = await this.getClassByName(className, schoolName);

				if (Class) {
					const { announcements } = Class;

					const actualAnnouncements = announcements.filter(
						({ to }) => getPureDate(maxDate).getTime() - getPureDate(to).getTime() <= 0,
					);

					await Class.updateOne({ announcements: actualAnnouncements });

					return actualAnnouncements;
				} else {
					return [];
				}
			} else {
				throw new TypeError(`ClassName must be string, got ${className}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				console.error(e);
				return [];
			}
			throw e;
		}
	}

	//! Students

	//* Settings
	async changeSettings(vkId, diffObject) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				if (typeof diffObject === 'object' && diffObject !== null) {
					const Student = await this.getStudentByVkId(vkId);
					if (Student) {
						let settings = Student.settings;
						for (const key in diffObject) {
							if (key in settings) {
								settings[key] = diffObject[key];
							}
						}
						await Student.updateOne({ settings });
						return true;
					} else {
						return false;
					}
				} else {
					throw new TypeError(
						`diffObject must be an object of diffs in object, got ${diffObject}`,
					);
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.log(e);
			return false;
		}
	}
	async changeLastHomeworkCheckDate(vkId, newCheckDate) {
		try {
			if (typeof vkId === 'number') {
				if (newCheckDate instanceof Date) {
					const Student = await this.getStudentByVkId(vkId);

					if (Student) {
						await Student.updateOne({
							lastHomeworkCheck: newCheckDate,
						});
						return true;
					} else {
						return false;
					}
				} else {
					throw new TypeError(`newCheckDate must be a Date, got ${newCheckDate}`);
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.error(e);
			return false;
		}
	}

	//* Roles utils
	async getRole(id) {
		try {
			let Student;

			if (typeof id === 'number') {
				Student = await _Student.findOne({ vkId: id });
			} else if (isObjectId(id)) {
				Student = await _Student.findById(id);
			} else {
				throw new TypeError(`Id must be a number or an objectId, got ${id}`);
			}

			if (Student) {
				return Student.role;
			} else {
				return null;
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.error(e);
		}
	}
	async backStudentToInitialRole(vkId) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				const Student = await this.getStudentByVkId(vkId);
				if (Student) {
					await Student.updateOne({ role: Roles.student });
					return true;
				} else {
					return false;
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) throw e;
			console.error(e);
			return false;
		}
	} //Возвращает редактора к роли ученика

	//* Interactions
	async addStudentToClass(vkId, className, schoolName) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				if (className && typeof className === 'string') {
					const Class = await this.getClassByName(className, schoolName);
					const Student = await this.getStudentByVkId(vkId);
					if (Class && Student) {
						await Class.updateOne({
							$addToSet: { students: Student._id },
						});
						await Student.updateOne({
							class: Class._id,
							role:
								Class.students.length === 0 && Student.role === Roles.student
									? Roles.contributor
									: Student.role,
						});
						return true;
					} else {
						return false;
					}
				} else {
					throw new TypeError(`ClassName must be string, got ${className}`);
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return false;
		}
	} //Добавляет ученика в класс
	async removeStudentFromClass(vkId) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				const Student = await this.populate(await this.getStudentByVkId(vkId));
				if (Student) {
					const Class = Student.class;
					if (!Class) return true;
					await Class.updateOne({
						students: Class.students.filter(
							({ _id }) => _id.toString() !== Student._id.toString(),
						),
					});
					await Student.updateOne({ class: null });
					return true;
				} else {
					return false;
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.error(e);
			return false;
		}
	} //Удаляет ученика из класса
	async changeClass(vkId, newClassName, schoolName) {
		try {
			if (vkId !== undefined && typeof vkId === 'number') {
				if (newClassName && typeof newClassName === 'string') {
					const Student = await this.populate(await this.getStudentByVkId(vkId));
					const newClass = await this.getClassByName(newClassName, schoolName);
					if (Student !== null) {
						if (newClass !== null) {
							if (Student.class !== null && Student.class !== undefined) {
								if (Student.class.name !== newClassName) {
									const removed = await this.removeStudentFromClass(vkId);
									if (!removed) {
										return false;
									}
								} else {
									return true;
								}
							}

							return await this.addStudentToClass(vkId, newClass.name, schoolName);
						} else {
							return false;
						}
					} else {
						return false;
					}
				} else {
					throw new TypeError(`newClassName must be string, got ${newClassName}`);
				}
			} else {
				throw new TypeError(`VkId must be type of number, got ${vkId}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return false;
		}
	} //Меняет класс ученика

	//! Helpers
	async populate(document) {
		try {
			if (document instanceof mongoose.Document) {
				if (document.students) {
					return await document.populate('students').execPopulate();
				} else if (document.class) {
					return await document.populate('class').execPopulate();
				} else if (document.classes) {
					return await document.populate('classes').execPopulate();
				} else {
					return document;
				}
			} else {
				if (document === null) {
					return null;
				}
				throw new TypeError(`Argument must be a Document, got ${document}`);
			}
		} catch (e) {
			if (e instanceof TypeError) {
				throw e;
			}
			console.log(e);
			return null;
		}
	} //
	validateContent(content) {
		const errors = [];
		if (content) {
			if (content !== null && content.toString() === '[object Object]') {
				if (
					Object.keys(content).length > 0 &&
					Object.keys(content).length <= 2 &&
					Object.keys(content).every((key) => ['attachments', 'text'].includes(key))
				) {
					if (
						content.attachments.length > 0 &&
						(!Array.isArray(content.attachments) ||
							content.attachments.some((at) => !this.validateAttachment(at)))
					) {
						errors.push('Invalid attachments');
					}
					if (
						content.text !== undefined &&
						content.text !== '' &&
						typeof content.text !== 'string'
					) {
						errors.push('Text must be a string');
					}
				} else {
					errors.push('Invalid content structure');
				}
			} else {
				errors.push('Content must be an object');
			}
		} else {
			errors.push("Content can't be undefined");
		}
		return errors;
	} //
	validateAttachment(attachment) {
		if (typeof attachment === 'object') {
			return (
				attachment.hasOwnProperty('value') &&
				/[a-z]+-?\d+_-?\d+(_.+)?/.test(attachment.value) &&
				attachment.hasOwnProperty('url')
			);
		}
	} //
	validateDate(
		date,
		maxDate,
		minDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()),
		d = 0,
	) {
		let flag = undefined;

		if (date instanceof Date) {
			if (maxDate && maxDate instanceof Date) {
				flag = undefined ?? maxDate.getTime() - date.getTime() >= d;
			}
			if (minDate && minDate instanceof Date) {
				flag = undefined ?? date.getTime() - minDate.getTime() >= d;
			}
			return flag ?? true;
		} else if (typeof date === 'string') {
			if (Date.parse(date)) {
				return this.validateDate(new Date(Date.parse(date)), maxDate, minDate);
			}
			return false;
		} else if (typeof date === 'number') {
			return this.validateDate(new Date(date), maxDate, minDate);
		} else {
			return false;
		}
	}

	connect(...args) {
		mongoose.connect(this.uri, ...args);
	}
}

module.exports.DataBase = DataBase;
