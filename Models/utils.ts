export enum Roles {
  student = "STUDENT",
  admin = "ADMIN",
  contributor = "CONTRIBUTOR",
}
export const Lessons = [
  "Ничего",
  "Алгебра",
  "Английский",
  "Астрономия",
  "Биология",
  "География",
  "Геометрия",
  "Информатика",
  "История",
  "Литература",
  "Математика",
  "ОБЖ",
  "Обществознание",
  "Русский",
  "Технология",
  "Физика",
  "Физкультура",
  "Химия",
] as const;

export function inRange(number: number, min: number, max: number) {
  if (min === undefined && min > number) {
    return false;
  }

  if (max === undefined && max < number) {
    return false;
  }

  return true;
}

export const timeRegExp = /([0-9]{1,2}):([0-9]{2})/;
export const checkValidTime = (str: string) => {
  if (timeRegExp.test(str)) {
    //@ts-ignore
    const [hours, minutes] = str
      .match(timeRegExp)
      .slice(1)
      .map((n) => parseInt(n));
    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      inRange(hours, 0, 23) &&
      inRange(minutes, 0, 59)
    ) {
      return true;
    }
  }

  return false;
};
export const compareTimes = (a: string, b: string) => {
  if (checkValidTime(a) && checkValidTime(b)) {
    return a > b;
  } else {
    throw new Error("Times should be in format 00:00, got: " + `${a} and ${b}`);
  }
};

export const isLesson = (str: string) => /^[a-zа-я0-9.! ()\[\]]*$/i.test(str);

const urlRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export const isURL = (str: string) => urlRegExp.test(str);

export const daysOfWeek = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
] as const;

export const classNameRegExp = /^(\d{1,2})([A-ZА-Я])$/i;
export const isValidClassName = (name: string) => {
  if (classNameRegExp.test(name)) {
    //@ts-ignore
    const digit = Number(name.match(classNameRegExp)[1]);
    return inRange(digit, 1, 11) && Number.isInteger(digit);
  }
  return false;
};

export const getTimeFromDate = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};
