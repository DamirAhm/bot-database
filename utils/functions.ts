import { IStudent, IContent, IHomework } from '../types';
import mongoose from 'mongoose';

export const dayInMilliseconds = 24 * 60 * 60 * 1000;

export const findNextDayWithLesson = (
	schedule: string[][],
	lesson: string,
	currentWeekDay: number,
) => {
	let lastIndex = -1;
	if (schedule.slice(currentWeekDay).find((e) => e.includes(lesson))) {
		lastIndex =
			schedule.slice(currentWeekDay).findIndex((e) => e.includes(lesson)) +
			currentWeekDay +
			1;
	} else if (schedule.find((e) => e.includes(lesson))) {
		lastIndex = schedule.findIndex((e) => e.includes(lesson)) + 1;
	}
	return lastIndex;
};

export const findNextLessonDate = (
	nextLessonWeekDay: number,
	{ currentDate = new Date() } = {},
): Date => {
	if (nextLessonWeekDay <= 7 && nextLessonWeekDay > 0) {
		const weekDay = currentDate.getDay() || 7; //Чтобы воскресенье было 7 днем недели
		const addition = nextLessonWeekDay <= weekDay ? 7 : 0; //Равно 7 если урок на следующей неделе

		let date = currentDate.getDate() + addition - (weekDay - nextLessonWeekDay);
		let month = currentDate.getMonth();

		return new Date(currentDate.getFullYear(), month, date);
	} else if (nextLessonWeekDay < 0) {
		throw new Error('Next lesson week day must be in range from 0 to 6');
	} else {
		throw new TypeError('Week day must be less or equal to 7');
	}
};

export const toObject = (Document: mongoose.Document) => JSON.parse(JSON.stringify(Document));
export const isObjectId = (id: string) => {
	return mongoose.Types.ObjectId.isValid(id);
};

export const findNotifiedStudents = (
	students: IStudent[],
	notificationDate: Date,
	maxRemindFrequency: number,
) => {
	return students.filter(({ settings: sets, lastHomeworkCheck }) => {
		if (sets.notificationsEnabled) {
			//Проверяет что уведомления включены
			if (
				notificationDate.getHours() === Number(sets.notificationTime.match(/^\d*/)?.[0]) &&
				Math.abs(
					notificationDate.getMinutes() - Number(sets.notificationTime.match(/\d*$/)),
				) <= 1
			) {
				//Проверяет что время совпадает или почти
				if (Number(notificationDate) - Number(lastHomeworkCheck) >= maxRemindFrequency) {
					//Проверяет что чел недавно (3 часа) сам не чекал дз}
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	});
};

export const lessonsIndexesToLessonsNames = (lessonList: string[], indexes: number[][]) => {
	if (
		Array.isArray(indexes) &&
		indexes.length > 0 &&
		indexes.every((lesson) => Array.isArray(lesson) && lesson.every(Number.isInteger)) //lessonList должен быть массивом массивов целых чисел
	) {
		if (lessonList.length - 1 < Math.max(...indexes.flat())) {
			throw new ReferenceError(
				'Index in indexes array can`t be bigger than lesson list length',
			);
		}
		return indexes.map((dayIdxs) => dayIdxs.map((idx) => lessonList[idx])); //превращает массив индексов в массив предметов
	} else {
		throw new TypeError('lessonsIndexesByDays must be array of arrays of integers');
	}
};

export const checkIsToday = (date: Date, to = new Date()) => {
	return (
		to.getDate() === date.getDate() &&
		date.getMonth() === to.getMonth() &&
		date.getFullYear() === to.getFullYear()
	);
};

export const isPartialOf = (object: object | string[], instance: object) => {
	if (Array.isArray(object)) return Object.keys(instance).every((key) => object.includes(key));
	else {
		return (
			Object.keys(instance).length !== 0 &&
			Object.keys(instance).every((key) => object.hasOwnProperty(key))
		);
	}
};
export const filterContentByDate = <T extends IContent>(content: T[], date: Date) => {
	return content.filter(
		(cont) =>
			Math.abs(cont.to.getTime() - date.getTime()) <= dayInMilliseconds &&
			cont.to.getDate() === date.getDate(),
	);
};
export const mapHomeworkByLesson = (homework: IHomework[]) => {
	return homework.reduce(
		(acc, c) => (acc.has(c.lesson) ? acc.get(c.lesson).push(c) : acc.set(c.lesson, [c]), acc),
		new Map(),
	);
};

export const deeplyAssignObjects = <T extends Record<string, any>>(objA: T, objB: T): T => {
	let assignedObject = objA;
	const keys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));
	for (const key of keys) {
		if (
			['[object Object]', '[object Map]'].includes(objA[key]?.toString()) &&
			['[object Object]', '[object Map]'].includes(objB[key]?.toString())
		) {
			let assignedProperty;
			if (objA[key] instanceof Map) {
				if (objB[key] instanceof Map) {
					assignedProperty = exports.deeplyAssignObjects(
						Object.fromEntries(objA[key]),
						Object.fromEntries(objB[key]),
					);
				} else {
					assignedProperty = exports.deeplyAssignObjects(
						Object.fromEntries(objA[key]),
						objB[key],
					);
				}
				//@ts-ignore
				assignedObject[key] = new Map(Object.entries(assignedProperty));
			} else {
				if (objB[key] instanceof Map) {
					assignedProperty = exports.deeplyAssignObjects(
						objA[key],
						Object.fromEntries(objB[key]),
					);
				} else {
					assignedProperty = exports.deeplyAssignObjects(objA[key], objB[key]);
				}
				//@ts-ignore
				assignedObject[key] = assignedProperty;
			}
		} else {
			//@ts-ignore
			assignedObject[key] = objB[key] ?? objA[key];
		}
	}

	return assignedObject;
};
