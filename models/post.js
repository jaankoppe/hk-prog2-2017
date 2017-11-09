const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {type: ObjectId, ref: 'User', required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Post', postSchema);