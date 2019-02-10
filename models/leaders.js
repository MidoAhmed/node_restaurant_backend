const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var LeaderSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        default: ''
    },
    abbr: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default:false
    }
}, {
    timestamps: true
});

var leaders = mongoose.model('Leader', LeaderSchema);

module.exports = leaders;