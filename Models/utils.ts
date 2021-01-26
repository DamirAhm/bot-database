export enum Roles {
	student = 'STUDENT',
	admin = 'ADMIN',
	contributor = 'CONTRIBUTOR',
}
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
] as const;
export const checkValidTime = (str: string) => {
	return (
		!isNaN(+str[0]) &&
		+str[0] >= 0 &&
		!isNaN(+str[1]) &&
		+str[1] >= 0 &&
		str[2] === ':' &&
		!isNaN(+str[3]) &&
		+str[3] >= 0 &&
		!isNaN(+str[4]) &&
		+str[4] >= 0
	);
};

export const deeplyAssignObjects = <T extends object>(objA: T, objB: T): T => {
	const entries = [...Object.entries(objA), ...Object.entries(objB)];
	const primitiveEntries = entries.filter(([_, value]) => typeof value !== 'object');
	const objectEntrieKeys = entries
		.filter(([_, value]) => typeof value === 'object')
		.map((key) => key);

	const assertedObject = Object.fromEntries(primitiveEntries);

	for (const [key] of objectEntrieKeys) {
		//@ts-ignore
		if (objA[key] && objB[key]) {
			//@ts-ignore
			if (objA[key] instanceof Map) {
				const assertedMapObjects = deeplyAssignObjects(
					//@ts-ignore
					Object.fromEntries(objA[key]),
					//@ts-ignore
					Object.fromEntries(objB[key]),
				);
				const assertedMap = new Map(Object.entries(assertedMapObjects));

				assertedObject[key] = assertedMap;
			} else {
				//@ts-ignore
				const assertedObjects = deeplyAssignObjects(objA[key], objB[key]);

				assertedObject[key] = assertedObjects;
			}
		} else {
			//@ts-ignore
			assertedObject[key] = objA[key] || objB[key];
		}
	}

	return assertedObject as T;
};

export const isLesson = (str: string) => /^[a-zа-я0-9.! ]*$/i.test(str);

const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export const isURL = (str: string) => urlRegExp.test(str);

export const daysOfWeek = [
	'Понедельник',
	'Вторник',
	'Среда',
	'Четверг',
	'Пятница',
	'Суббота',
] as const;

export const isValidClassName = (name: string) => {
	if (/(^\d{2})([A-Z]|[А-Я])/i.test(name)) {
		const [_, digit] = name.match(/(^\d{2})([A-Z]|[А-Я])/i) as RegExpMatchArray;
		return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
	}
	return false;
};
