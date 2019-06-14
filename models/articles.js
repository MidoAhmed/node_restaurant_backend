const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

let ArticleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false,
        default: ''
    },
    comments: [commentSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

ArticleSchema.methods.toWeb = function () {
    let json = this.toJSON();
    json.id = this._id;//this is for the front end
    return json;
};

let Articles = mongoose.model('Article', ArticleSchema);
module.exports = Articles;