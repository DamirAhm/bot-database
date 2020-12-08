"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const utils_1 = require("./utils");
const studentSchema = new mongoose_1.default.Schema({
    class: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Class',
    },
    role: {
        type: String,
        default: utils_1.Roles.student,
        enum: Object.values(utils_1.Roles),
        required: true,
    },
    vkId: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: Number.isInteger,
            message: 'VkId must be integer',
        },
    },
    settings: {
        notificationsEnabled: {
            type: Boolean,
            default: true,
        },
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
    },
    lastHomeworkCheck: {
        type: Date,
        default: new Date(0),
        validate: {
            validator: (date) => Date.now() - date.getTime() >= 0,
            message: 'Last check of homework time can`t be in the future',
        },
    },
    fullName: {
        type: String,
        required: true,
    },
    registered: {
        type: Boolean,
        default: false,
    },
});
const fullNameRegExp = /^\w*\s\w*$/;
const isValidFullName = (str) => fullNameRegExp.test(str);
studentSchema
    .virtual('firstName')
    .get(function () {
    //@ts-ignore
    return this.fullName.split(' ')[0];
})
    .set(function (value) {
    if (isValidFullName(value)) {
        //@ts-ignore
        this.fullName = (this.fullName ?? '').replace(/^\w*/, value.toString());
    }
    else {
        //@ts-ignore
        this.fullName = value;
    }
});
studentSchema
    .virtual('secondName')
    .get(function () {
    //@ts-ignore
    return this.fullName.split(' ')[1];
})
    .set(function (value) {
    if (isValidFullName(value)) {
        //@ts-ignore
        this.fullName = (this.fullName ?? '').replace(/\w*$/, value.toString());
    }
    else {
        //@ts-ignore
        this.fullName += ` ${value}`;
    }
});
exports.default = mongoose_1.default.model('Student', studentSchema);
//# sourceMappingURL=StudentModel.js.map