"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const utils_1 = require("./utils");
const attachmentSchema = {
    value: {
        type: String,
        validate: {
            validator: (str) => /^(photo|doc|video|audio|link)-?[0-9]+(_[0-9]+)(_[a-z0-9])?/i.test(str),
            message: 'url must be a valid vk attachment',
        },
        required: true,
    },
    url: {
        type: String,
        validate: {
            validator: utils_1.isURL,
            message: 'url must be a valid URL',
        },
        required: true,
    },
    album_id: {
        type: Number,
    },
};
const UserPreferencesSchema = {
    notificationTime: {
        type: String,
        default: '17:00',
        validate: {
            validator: utils_1.checkValidTime,
            message: 'Notification time should match template like 00:00',
        },
    },
    daysForNotification: {
        type: [Number],
        default: [1],
        validate: {
            validator: (array) => array.every((number) => Number.isInteger(number) && number >= 0) &&
                array.length > 0,
            message: "Day index must be an integer and mustn't be empty",
        },
    },
    notificationEnabled: {
        type: Boolean,
        default: true,
    },
    default: {},
};
const HomeworkSchema = {
    lesson: {
        type: String,
        validate: {
            validator: utils_1.isLesson,
            message: 'Lesson must be a set of letters, space or dot ',
        },
    },
    text: String,
    to: {
        type: Date,
        default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    attachments: {
        type: [attachmentSchema],
        default: [],
    },
    createdBy: {
        type: Number,
        validate: {
            validator: isPositiveInteger,
            message: 'Created by must be integer means vk id of user created it',
        },
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    userPreferences: {
        type: Map,
        of: new mongoose_1.default.Schema(UserPreferencesSchema, { _id: false }),
        get: (map) => Object.fromEntries(map),
        set: (obj) => obj instanceof Map ? obj : new Map(Object.entries(obj)),
        default: {},
    },
    onlyFor: {
        type: [Number],
        validate: {
            message: 'User vk Ids must be positive integer',
            validator: (vkIds) => vkIds.every(isPositiveInteger),
        },
        default: [],
    },
    _id: {
        type: mongoose_1.default.Types.ObjectId,
        default: new mongoose_1.default.Types.ObjectId(),
    },
};
const AnnouncementsSchema = {
    text: String,
    attachments: {
        type: [attachmentSchema],
        default: [],
    },
    to: Date,
    createdBy: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: 'Created by must be integer means vk id of user created it',
        },
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    onlyFor: {
        type: [Number],
        validate: {
            message: 'User vk Ids must be positive integer',
            validator: (vkIds) => vkIds.every(isPositiveInteger),
        },
        default: [],
    },
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        default: new mongoose_1.default.Types.ObjectId(),
    },
};
const classSchema = new mongoose_1.default.Schema({
    students: {
        type: [
            {
                type: mongoose_1.default.Types.ObjectId,
                ref: 'Student',
            },
        ],
        default: [],
    },
    name: {
        type: String,
        validate: {
            validator: utils_1.isValidClassName,
            message: 'Class name must match digit + letter',
        },
        required: true,
    },
    homework: {
        type: [HomeworkSchema],
        default: [],
    },
    schedule: {
        type: [
            [
                {
                    type: String,
                    validate: {
                        validator: utils_1.isLesson,
                        message: 'Lesson must be a set of letters, space or dot ',
                    },
                },
            ],
        ],
        default: Array.from({ length: 6 }, () => []),
    },
    announcements: {
        type: [AnnouncementsSchema],
        default: [],
    },
    schoolName: {
        type: String,
        ref: 'Student',
        required: true,
    },
});
exports.default = mongoose_1.default.model('Class', classSchema);
function isPositiveInteger(n) {
    return Number.isInteger(n) && n > 0;
}
