"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolSchema = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
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
    name: {
        type: String,
        valudate: {
            validator: (str) => /^.*:\d*$/.test(str),
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
