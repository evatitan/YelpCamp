const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
//const passport = require('passport');

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	}
});
//此处不需要在model中设置username和password，使用以下的method即可，具体见doc。
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
