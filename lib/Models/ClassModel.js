"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const utils_1 = require("./utils");
const isLesson = (str) => /^[a-zа-я0-9]*$/i.test(str);
const attachment = new mongoose_1.default.Schema({
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
});
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
            validator: (name) => {
                if (/^\d{1,2}[a-zа-я]+$/i.test(name)) {
                    const [_, digit] = name.match(/^(\d{1,2})([a-zа-я]+)$/i);
                    return +digit > 0 && +digit <= 11 && Number.isInteger(+digit);
                }
                return false;
            },
            message: 'Class name must match digit + letter',
        },
        required: true,
    },
    homework: {
        type: [
            {
                lesson: {
                    required: true,
                    type: String,
                    validate: {
                        validator: isLesson,
                        message: 'Lesson must be one of existing',
                    },
                },
                text: String,
                to: {
                    type: Date,
                    default: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                },
                attachments: {
                    type: [attachment],
                    default: [],
                },
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
                _id: {
                    type: mongoose_1.default.Types.ObjectId,
                    default: new mongoose_1.default.Types.ObjectId(),
                },
            },
        ],
        default: [],
    },
    schedule: {
        type: [
            [
                {
                    type: String,
                    validate: {
                        validator: isLesson,
                        message: 'Lesson must be a set of letters',
                    },
                },
            ],
        ],
        default: [[], [], [], [], [], []],
    },
    announcements: {
        type: [
            {
                text: String,
                attachments: {
                    type: [attachment],
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
                _id: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    default: new mongoose_1.default.Types.ObjectId(),
                },
            },
        ],
        default: [],
    },
    schoolName: {
        type: String,
        ref: 'Student',
        required: true,
    },
});
exports.default = mongoose_1.default.model('Class', classSchema);
//# sourceMappingURL=ClassModel.js.map