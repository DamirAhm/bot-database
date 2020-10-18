const { isURL } = require('./utils');

const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
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
			validator: (str) => /^.*:\d*$/.test(str),
			message: 'School name must fit format',
		},
		required: true,
		unique: true,
	},
});

schoolSchema.virtual('city', {}).get(function () {
	return this.name.split(':')[0];
});
schoolSchema.virtual('number').get(function () {
	return this.name.split(':')[1];
});

module.exports = mongoose.model('School', schoolSchema);
