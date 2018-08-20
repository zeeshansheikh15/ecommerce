var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    brand: {type: String, required: true},
    title: {type: String, required: true},
    imagePath: {type: String, required: true},
    quantity: {type: Number, required: true},
    description: {type:String, required:true},
    price: {type: Number, required:true}
});

module.exports = mongoose.model('item',schema);