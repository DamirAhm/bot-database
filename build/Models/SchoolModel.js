"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const utils_1 = require("./utils");
const isValidSchoolName = (str) => /^[a-z]+:\d{1,}$/i.test(str);
const lessonCallsSchema = {
    start: {
        type: String,
        required: true,
        validate: {
            message: "Start must be a valid string in format '00:00'",
            validator: utils_1.checkValidTime,
        },
    },
    end: {
        type: String,
        required: true,
        validate: {
            message: "End must be a valid string in format '00:00'",
            validator: utils_1.checkValidTime,
        },
    },
};
const callScheduleSchema = {
    defaultSchedule: {
        type: [lessonCallsSchema],
        default: [],
        validate: {
            message: 'Times in array must be sorted',
            validator: (arr) => {
                const sortedArr = arr.sort();
                return arr.every((el, i) => sortedArr[i] === el);
            },
        },
    },
    exceptions: {
        type: [
            {
                type: [lessonCallsSchema],
                default: [],
                validate: {
                    message: 'Times in array must be sorted',
                    validator: (arr) => {
                        const sortedArr = arr.sort();
                        return arr.every((el, i) => sortedArr[i] === el);
                    },
                },
            },
        ],
        default: [[], [], [], [], [], []],
        validate: {
            message: 'Exceptions array must be a length of 6',
            validate: (arr) => utils_1.inRange(arr.length, 0, 6),
        },
    },
};
exports.schoolSchema = new mongoose_1.default.Schema({
    classes: {
        type: [
            {
                type: mongoose_1.default.Types.ObjectId,
                ref: 'Class',
            },
        ],
        default: [],
    },
    callSchedule: {
        type: callScheduleSchema,
        default: {
            defaultSchedule: [],
            exceptions: [[], [], [], [], [], []],
        },
    },
    name: {
        type: String,
        valudate: {
            validator: isValidSchoolName,
            message: 'School name must fit format',
        },
        required: true,
        unique: true,
    },
});
exports.schoolSchema.virtual('city', {}).get(function () {
    //@ts-ignore
    return (this.name ?? '').split(':')[0];
});
exports.schoolSchema.virtual('number').get(function () {
    //@ts-ignore
    return (this.name ?? '').split(':')[1];
});
exports.default = mongoose_1.default.model('School', exports.schoolSchema);
