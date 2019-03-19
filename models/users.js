const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
}, {
    timestamps: true
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

// validation
userSchema.methods.isEmailExists =  function(password) {

};
function isEmailExists(email, callback) {
    if (email) {
        mongoose.models['User'].count({ _id: { '$ne': this._id }, email: email }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(!result);
        })
    }
}

userSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    //expirationDate.setDate(today.getDate() + 1);
    expirationDate.setMinutes(today.getMinutes() + 5); // expires in 5 min

    return jwt.sign({
        id: this._id,
        email: this.email,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
        sub: 'subject'
    }, 'your_jwt_secret');
};

userSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        email: this.email,
        token: this.generateJWT(),
    };
};

var Users = mongoose.model('User', userSchema);

module.exports = Users;