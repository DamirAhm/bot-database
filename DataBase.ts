import { compareTimes, getTimeFromDate, inRange, Roles } from './Models/utils';
import _Student from './Models/StudentModel';
import _School from './Models/SchoolModel';
import _Class from './Models/ClassModel';
import {
	findNextDayWithLesson,
	findNextLessonDate,
	findNotifiedStudents,
	checkIsToday,
	dayInMilliseconds,
	deeplyAssignObjects,
} from './utils/functions';
import mongoose from 'mongoose';
import {
	ClassDocument,
	IAnnouncement,
	IAttachment,
	IClassData,
	IContent,
	ICreateAnnouncement,
	ICreateContent,
	ICreateHomework,
	ICreateStudentParams,
	IHomework,
	ISettings,
	lessonCalls,
	PopulatedClass,
	PopulatedSchool,
	PopulatedStudent,
	SchoolDocument,
	StudentDocument,
} from './types';
const isObjectId = mongoose.Types.ObjectId.isValid;

const getPureDate = (date: Date) => {
	if (date && date instanceof Date) {
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();

		return new Date(year, month, day);
	} else {
		throw new Error('Ожидалась дата, дано: ' + JSON.stringify(date));
	}
};

function isClassPopulated(Document: ClassDocument | PopulatedClass): Document is PopulatedClass {
	return typeof Document === 'object' && 'vkId' in Document.students[0];
}
function isStudentPopulated(
	Document: StudentDocument | PopulatedStudent,
): Document is PopulatedStudent {
	return typeof Document === 'object' && (Document.class === null || 'name' in Document.class);
}
function isSchoolPopulated(
	Document: SchoolDocument | PopulatedSchool,
): Document is PopulatedSchool {
	return typeof Document === 'object' && 'name' in Document.classes[0];
}

type ObjectId = mongoose.Types.ObjectId;

//TODO Replace returns of false and null to errors or error codes
export class DataBase {
	uri: string;
	constructor(uri: string) {
		if (uri) {
			this.uri = uri;
		} else {
			throw new Error('You must pass an DataBase uri to constructor');
		}
	}

	//! Getters
	async getSchoolByName(schoolName: string) {
		return await _School.findOne({ name: schoolName });
	}
	async getSchoolBy_Id(_id: string | ObjectId) {
		return await _School.findById(_id);
	}

	async getStudentByVkId(vkId: number) {
		return await _Student.findOne({ vkId });
	} //Возвращает ученика по его id из vk
	async getStudentBy_Id(_id: string | ObjectId) {
		return await _Student.findById(_id);
	} //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))

	async getClassByName(name: string, schoolName: string) {
		return await _Class.findOne({ name, schoolName });
	} //Возвращает класс по его имени
	async getClassBy_Id(_id: string | ObjectId) {
		return await _Class.findById(_id);
	} //Возвращает ученика по его _id (это чисто для разработки (так быстрее ищется))

	async getAllContributors(schoolName?: string) {
		let classes: ClassDocument[];
		if (schoolName) {
			classes = await this.getClassesForSchool(schoolName);
		} else {
			classes = await this.getAllClasses();
		}

		return Promise.all(
			classes
				.reduce((acc, c) => acc.concat(c.students), [] as ObjectId[])
				.map((studentId) => this.getStudentBy_Id(studentId)),
		).then((students) =>
			(students.filter(
				(student) => student !== null,
			) as StudentDocument[]).filter(({ role }) =>
				[Roles.contributor, Roles.admin].includes(role),
			),
		);
	} //Возвращает список всех редакторов

	async getAllStudents(schoolName?: string) {
		let classes: ClassDocument[];
		if (schoolName) {
			classes = await this.getClassesForSchool(schoolName);
		} else {
			return await _Student.find({});
		}

		return Promise.all(
			classes
				.reduce((acc, c) => acc.concat(c.students), [] as ObjectId[])
				.map((studentId) => this.getStudentBy_Id(studentId)),
		).then((students) => students.filter((student) => student !== null) as StudentDocument[]);
	}
	async getAllClasses(schoolName?: string) {
		return (await _Class.find(!schoolName ? {} : { schoolName })) || [];
	}
	async getAllSchools() {
		return await _School.find({});
	}

	async getStudentsCount(
		classNameOrInstance: string | ClassDocument | PopulatedClass,
		schoolName: string,
	) {
		let Class: PopulatedClass | ClassDocument | null;

		if (typeof classNameOrInstance === 'string') {
			Class = await this.getClassByName(classNameOrInstance, schoolName);
		} else {
			Class = classNameOrInstance;
		}

		if (Class) {
			return await _Student.count({ class: Class._id });
		} else {
			return 0;
		}
	}

	async getStudentsFromClass(
		classNameOrInstance: string | ClassDocument | PopulatedClass,
		schoolName: string,
	) {
		if (typeof classNameOrInstance === 'object' && isClassPopulated(classNameOrInstance)) {
			return classNameOrInstance.students;
		}

		let Class: ClassDocument | null;
		if (typeof classNameOrInstance === 'string') {
			Class = await this.getClassByName(classNameOrInstance, schoolName);
		} else {
			Class = classNameOrInstance;
		}

		if (Class) {
			const { students } = await this.populate(Class);

			return students;
		} else {
			return [];
		}
	}

	async getClassesForSchool(
		schoolNameOrInstance: string | SchoolDocument | PopulatedSchool,
	): Promise<ClassDocument[]> {
		if (typeof schoolNameOrInstance === 'string') {
			return _Class.find({ schoolName: schoolNameOrInstance });
		} else {
			return _Class.find({ schoolName: schoolNameOrInstance.name });
		}
	}

	async getStudentsForSchool(schoolNameOrInstance: string | SchoolDocument | PopulatedSchool) {
		const Classes = await this.getClassesForSchool(schoolNameOrInstance);

		if (Classes) {
			const PopulatedClasses = await Promise.all(
				Classes.map((Class) => this.populate(Class)),
			);

			const schoolStudents = PopulatedClasses.reduce(
				(acc, c) => acc.concat(c.students),
				[] as StudentDocument[],
			);

			return schoolStudents;
		}

		return [];
	}
	async getSchoolsForCity(cityName: string) {
		const Schools = await _School.find({
			name: { $regex: new RegExp(`^${cityName}:`) },
		});
		return Schools || [];
	}

	async getSchoolForStudent(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent) {
		if (
			typeof vkIdOrStudentInstance === 'object' &&
			isStudentPopulated(vkIdOrStudentInstance)
		) {
			if (vkIdOrStudentInstance.class) {
				return this.getSchoolByName(vkIdOrStudentInstance.class.schoolName);
			} else {
				return null;
			}
		}

		let Student: StudentDocument | null;
		if (typeof vkIdOrStudentInstance === 'number') {
			Student = await this.getStudentByVkId(vkIdOrStudentInstance);
		} else {
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

	async getClassForStudent(
		idOrInstance: number | StudentDocument | PopulatedStudent,
	): Promise<ClassDocument | null> {
		if (typeof idOrInstance === 'object') {
			if (isStudentPopulated(idOrInstance)) {
				return idOrInstance.class;
			} else {
				if (idOrInstance.class === null) return null;
				return await this.getClassBy_Id(idOrInstance.class);
			}
		}

		const Student = await this.getStudentByVkId(idOrInstance);

		if (Student) {
			return _Class.findById(Student.class);
		}

		return null;
	}

	//! Creators
	async createStudent(
		vkId: number,
		{
			class_id = null,
			firstName = '',
			lastName = '',
			registered = false,
		}: ICreateStudentParams,
	) {
		let newStudentInfo = { vkId, firstName, lastName, registered };
		const newStudent = new _Student(newStudentInfo);
		if (class_id) {
			const Class = await this.getClassBy_Id(class_id);

			if (Class) {
				await Class.updateOne({
					$addToSet: {
						students: newStudent._id,
					},
				});
				newStudent.class = Class._id;
				newStudent.role = Class.students.length === 0 ? Roles.contributor : newStudent.role;
			}
		}
		await newStudent.save();
		return await this.getStudentBy_Id(newStudent._id);
	} //Создает и возвращает ученика
	async createClass(name: string, schoolName: string) {
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
	} //Создает и возвращает класс
	async createSchool(name: string) {
		const School = new _School({ name });

		await School.save();
		return School;
	}

	//! Classes

	//* Homework
	async addHomework(
		classData: IClassData,
		content: ICreateHomework,
		studentVkId: number,
		expirationDate?: Date,
	) {
		if (this.validateContent(content).length === 0) {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				if (Class.schedule.flat().includes(content.lesson)) {
					const newHomework: IHomework = {
						_id: new mongoose.Types.ObjectId(),
						to: new Date(),
						createdBy: studentVkId,
						pinned: false,
						userPreferences: {},
						...content,
					};

					if (expirationDate) {
						if (this.validateDate(expirationDate, undefined, getTodayDate())) {
							newHomework.to = expirationDate;
							await Class.updateOne({
								$push: { homework: newHomework },
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
							content.lesson,
							new Date().getDay() || 7,
						); // 1 - 7
						const nextLessonDate = findNextLessonDate(nextLessonWeekDay);
						newHomework.to = nextLessonDate;
						await Class.updateOne({
							$push: { homework: newHomework },
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
	} //Добавляет жомашнее задание в класс

	async removeHomework(classData: IClassData, homeworkId: string | ObjectId) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			await Class.updateOne({
				homework: Class.homework.filter((hw) => hw._id.toString() !== homeworkId),
			});
			return true;
		} else {
			return false;
		}
	}
	async getHomework(classData: IClassData, date?: Date) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			if (date) {
				return Class.homework.filter(({ to }) => checkIsToday(date, to));
			} else {
				return Class.homework;
			}
		} else {
			return [];
		}
	} //
	async updateHomework(
		classData: IClassData,
		homeworkId: string,
		updates: Partial<Omit<IHomework, '_id'>>,
	) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			const updatedHomework = Class.homework.map((ch) =>
				ch._id.toString() === homeworkId.toString()
					? deeplyAssignObjects(ch, updates as IHomework)
					: ch,
			);

			await Class.updateOne({
				homework: updatedHomework,
			});

			return await this.getClassBy_Id(Class._id).then((cl) => cl?.homework || null);
		} else {
			return [];
		}
	}
	async getHomeworkByDate(classData: IClassData, date: Date) {
		const Class = await this.getClassByClassData(classData);

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
	}
	async removeOldHomework(classData: IClassData, maxDate: Date = new Date()) {
		const Class = await this.getClassByClassData(classData);

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
	}
	async togglePinHomework(classData: IClassData, homeworkId: string | ObjectId) {
		try {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				const homework = Class.homework.find(
					({ _id }) => _id.toString() === homeworkId.toString(),
				);

				if (homework) {
					homework.pinned = !homework.pinned;
					await Class.save();

					return true;
				}
			}

			return false;
		} catch (e) {
			console.error(e);
			if (e instanceof TypeError) throw e;

			return false;
		}
	}
	async unpinAllHomework(classData: IClassData) {
		try {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				await Class.updateOne({ $set: { 'homework.$[].pinned': false } });

				return true;
			}

			return false;
		} catch (e) {
			console.error(e);
			if (e instanceof TypeError) throw e;

			return false;
		}
	}

	//TODO refactor returning data from array to object
	async parseHomeworkToNotifications(currentDateForTest: Date) {
		const classes: ClassDocument[] = await _Class.find({});
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
	async setSchedule(classData: IClassData, newSchedule: string[][]) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			await Class.updateOne({ schedule: newSchedule });
			return true;
		} else {
			return false;
		}
	}

	async changeDay(classData: IClassData, dayIndex: number, newLessonsForDay: string[]) {
		if (dayIndex <= 5 && dayIndex >= 0) {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				const schedule = [...Class.schedule];
				schedule[dayIndex] = newLessonsForDay;
				await Class.updateOne({ schedule });
				return schedule;
			} else {
				return false;
			}
		} else {
			throw new TypeError(
				`day index must be number less than 6 and greater than 0, got ${dayIndex}`,
			);
		}
	}
	async getSchedule(classData: IClassData) {
		const Class = await this.getClassByClassData(classData);
		if (Class) {
			return Class.schedule;
		} else {
			return [];
		}
	}

	//* Call Schedule
	async getCallSchedule(classData: IClassData) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			return Class?.callSchedule;
		} else {
			return null;
		}
	}
	async getCallCheduleForDay(classData: IClassData, dayIndex: number) {
		try {
			let Class = await this.getClassByClassData(classData);

			if (Class) {
				if (inRange(dayIndex, 0, 5)) {
					if (Class.callSchedule.exceptions[dayIndex].length > 0) {
						return Class.callSchedule.exceptions[dayIndex];
					} else {
						return Class.callSchedule.default;
					}
				} else {
					throw new Error('Day index must be in range 0 to 5, got: ' + dayIndex);
				}
			} else {
				return null;
			}
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	async addCallScheduleException(
		classData: IClassData,
		dayIndex: number,
		schedule: lessonCalls[],
	) {
		try {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				if (inRange(dayIndex, 0, 5)) {
					Class.callSchedule.exceptions[dayIndex] = schedule;
					await Class.save();

					return true;
				} else {
					throw new Error('Day index must be in range 0 to 5, got: ' + dayIndex);
				}
			} else {
				return false;
			}
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	getLessonAtSpecificTime(callSchedule: lessonCalls[], date: Date) {
		const lessonEnds = callSchedule.map(({ end }) => end);
		const time = getTimeFromDate(date);

		let index = 0;

		while (compareTimes(time, lessonEnds[index])) index++;

		return callSchedule[index];
	}
	getNextCallTime(callSchedule: lessonCalls[], date: Date) {
		const currentLesson = this.getLessonAtSpecificTime(callSchedule, date);
		const currentTime = getTimeFromDate(date);

		if (compareTimes(currentLesson.start, currentTime)) return currentLesson.start;
		else return currentLesson.end;
	}

	//* Announcements
	async addAnnouncement(
		classData: IClassData,
		content: ICreateAnnouncement,
		toDate: Date = new Date(),
		toAll: boolean = false,
		vkId: number,
	) {
		if (this.validateContent(content).length === 0) {
			if (this.validateDate(toDate, undefined, getTodayDate())) {
				const Class = await this.getClassByClassData(classData);

				if (Class) {
					const newAnnouncement: IAnnouncement = {
						createdBy: vkId,
						to: new Date(),
						pinned: false,
						_id: new mongoose.Types.ObjectId(),
						...content,
					};

					if (toAll) {
						const classes = await _Class.find({});
						for (const _class of classes) {
							await _class.updateOne({
								$push: { announcements: newAnnouncement },
							});
						}
						return newAnnouncement._id;
					} else {
						await Class.updateOne({
							$push: { announcements: newAnnouncement },
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
	} //

	async getAnnouncements(classData: IClassData, date?: Date) {
		let Class = await this.getClassByClassData(classData);

		if (Class) {
			if (date) {
				return Class.announcements.filter((ch) => checkIsToday(ch.to, date));
			} else {
				return Class.announcements;
			}
		} else {
			return null;
		}
	} //

	async removeAnnouncement(classData: IClassData, announcementId: string | ObjectId) {
		const Class = await this.getClassByClassData(classData);

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
	}

	async updateAnnouncement(
		classData: IClassData,
		announcementId: string | ObjectId,
		updates: Partial<Omit<IAnnouncement, '_id'>>,
	) {
		const Class = await this.getClassByClassData(classData);

		if (Class) {
			const updatedAnnouncements = Class.announcements.map((announcement) =>
				announcement._id.toString() === announcementId.toString()
					? deeplyAssignObjects(announcement, updates as IAnnouncement)
					: announcement,
			);

			await Class.updateOne({
				announcements: updatedAnnouncements,
			});

			return await this.getClassBy_Id(Class._id).then((cl) => cl?.announcements || null);
		} else {
			return [];
		}
	}

	async removeOldAnnouncements(classData: IClassData, maxDate: Date = new Date()) {
		const Class = await this.getClassByClassData(classData);

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
	}

	async togglePinAnnouncement(classData: IClassData, announcementId: string | ObjectId) {
		try {
			const Class = await this.getClassByClassData(classData);

			if (Class) {
				const announcement = Class.announcements.find(({ _id }) => _id === announcementId);

				if (announcement) {
					announcement.pinned = !announcement.pinned;
					await Class.save();

					return true;
				}
			}

			return false;
		} catch (e) {
			console.error(e);
			if (e instanceof TypeError) throw e;

			return false;
		}
	}
	async unpinAllAnnouncements(classData: IClassData) {
		try {
			let Class = await this.getClassByClassData(classData);

			if (Class) {
				await Class.updateOne({ $set: { 'announcements.$[].pinned': false } });

				return true;
			}

			return false;
		} catch (e) {
			console.error(e);
			if (e instanceof TypeError) throw e;

			return false;
		}
	}

	//! Students

	//* Settings
	async changeSettings(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
		diffObject: Partial<ISettings>,
	) {
		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

		if (Student) {
			await Student.updateOne({ settings: { ...Student.settings, ...diffObject } });
			return true;
		} else {
			return false;
		}
	}
	async changeLastHomeworkCheckDate(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
		newCheckDate: Date,
	) {
		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

		if (Student) {
			await Student.updateOne({
				lastHomeworkCheck: newCheckDate,
			});
			return true;
		} else {
			return false;
		}
	}

	//* Roles utils
	async getRole(vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent) {
		try {
			const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

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
	async backStudentToInitialRole(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
	) {
		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

		if (Student) {
			await Student.updateOne({ role: Roles.student });
			return true;
		} else {
			return false;
		}
	} //Возвращает редактора к роли ученика

	//* Interactions
	async addStudentToClass(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
		classNameOrInstance: string | ClassDocument | PopulatedClass,
		schoolName?: string,
	): Promise<boolean> {
		const Class = await this.getClassByClassData({
			classNameOrInstance,
			schoolName: schoolName ?? '',
		});

		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

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
	} //Добавляет ученика в класс

	async removeStudentFromClass(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
	) {
		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

		if (!Student) return false;
		const PopulatedStudent = isStudentPopulated(Student)
			? Student
			: await this.populate(Student);

		const Class: ClassDocument = PopulatedStudent.class;
		if (!Class) return true;

		await Class.updateOne({
			students: Class.students.filter(
				(_id) => _id.toString() !== PopulatedStudent?._id.toString(),
			),
		});
		await PopulatedStudent.updateOne({ class: null });

		return true;
	} //Удаляет ученика из класса

	async changeClass(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
		newClassNameOrInstance: string | ClassDocument | PopulatedClass,
		schoolName?: string,
	) {
		const Student = await this.getStudentByStudentData(vkIdOrStudentInstance);

		const newClass = await this.getClassByClassData({
			classNameOrInstance: newClassNameOrInstance,
			schoolName: schoolName ?? '',
		});
		if (!(newClass && Student)) return false;

		const PopulatedStudent = isStudentPopulated(Student)
			? Student
			: await this.populate(Student);

		if (PopulatedStudent.class !== null && PopulatedStudent.class !== undefined) {
			if (PopulatedStudent.class.name !== newClass.name) {
				const removed = await this.removeStudentFromClass(PopulatedStudent);
				if (!removed) {
					return false;
				}
			} else {
				return true;
			}

			return await this.addStudentToClass(PopulatedStudent, newClass);
		} else {
			return false;
		}
	} //Меняет класс ученика

	//! Helpers
	populate(document: SchoolDocument): Promise<PopulatedSchool>;
	populate(document: StudentDocument): Promise<PopulatedStudent>;
	populate(document: ClassDocument): Promise<PopulatedClass>;
	async populate(document: any) {
		if ('students' in document) {
			return await document.populate('students').execPopulate();
		} else if ('class' in document) {
			return await document.populate('class').execPopulate();
		} else if ('classes' in document) {
			return await document.populate('classes').execPopulate();
		} else {
			return document;
		}
	} //
	validateContent(content: ICreateContent) {
		const errors: string[] = [];
		//TODO add validation for all content properties
		if (
			content.attachments.length > 0 &&
			(!Array.isArray(content.attachments) ||
				content.attachments.some((at) => !this.validateAttachment(at)))
		) {
			errors.push('Invalid attachments');
		}
		if (content.text !== undefined && content.text !== '' && typeof content.text !== 'string') {
			errors.push('Text must be a string');
		}

		return errors;
	} //
	validateAttachment(attachment: IAttachment) {
		return (
			attachment.hasOwnProperty('value') &&
			/[a-z]+-?\d+_-?\d+(_.+)?/.test(attachment.value) &&
			attachment.hasOwnProperty('url')
		);
	} //
	validateDate(
		date: Date | string | number,
		maxDate?: Date,
		minDate: Date = getTodayDate(),
	): boolean {
		let flag = undefined;

		if (date instanceof Date) {
			if (maxDate && maxDate instanceof Date) {
				flag = maxDate.getTime() - date.getTime() >= 0;
			}
			if (minDate && minDate instanceof Date) {
				flag = date.getTime() - minDate.getTime() >= 0;
			}
			return flag ?? true;
		} else if (typeof date === 'string') {
			if (Date.parse(date)) {
				return this.validateDate(new Date(Date.parse(date)), maxDate, minDate);
			}
			return false;
		} else if (typeof date === 'number') {
			return this.validateDate(new Date(date), maxDate, minDate);
		}

		return false;
	}

	async getClassByClassData({ classNameOrInstance, schoolName }: IClassData) {
		let Class: PopulatedClass | ClassDocument | null;
		if (typeof classNameOrInstance === 'string') {
			if (typeof schoolName === 'string') {
				Class = await this.getClassByName(classNameOrInstance, schoolName);
			} else {
				throw new Error('School name must be a string if class name is provided');
			}
		} else {
			Class = classNameOrInstance;
		}

		return Class;
	}
	async getStudentByStudentData(
		vkIdOrStudentInstance: number | StudentDocument | PopulatedStudent,
	) {
		let Student: PopulatedStudent | StudentDocument | null;
		if (typeof vkIdOrStudentInstance === 'number') {
			Student = await this.getStudentByVkId(vkIdOrStudentInstance);
		} else {
			Student = vkIdOrStudentInstance;
		}
		return Student;
	}

	connect(...args: any[]) {
		mongoose.connect(this.uri, ...args);
	}
}

module.exports.DataBase = DataBase;
function getTodayDate() {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
