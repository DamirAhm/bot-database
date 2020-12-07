import mongoose from 'mongoose';
export var schoolSchema = new mongoose.Schema({
    classes: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Class',
            },
        ],
        default: [],
    },
    name: {
        type: String,
        valudate: {
            validator: function (str) { return /^.*:\d*$/.test(str); },
            message: 'School name must fit format',
        },
        required: true,
        unique: true,
    },
});
schoolSchema.virtual('city', {}).get(function () {
    var _a;
    //@ts-ignore
    return ((_a = this.name) !== null && _a !== void 0 ? _a : '').split(':')[0];
});
schoolSchema.virtual('number').get(function () {
    var _a;
    //@ts-ignore
    return ((_a = this.name) !== null && _a !== void 0 ? _a : '').split(':')[1];
});
export default mongoose.model("School", schoolSchema);
