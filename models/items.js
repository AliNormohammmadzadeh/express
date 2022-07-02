const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    // id: {
    //     type: Number,
    //     required: true
    // },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
}, )

const Items = mongoose.model('items', ItemSchema)
module.exports = Items;