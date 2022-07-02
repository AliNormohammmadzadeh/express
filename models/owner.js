const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    }

})

const Owner = mongoose.model('owner', OwnerSchema)
module.exports = Owner;