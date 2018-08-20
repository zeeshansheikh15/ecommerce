var phones = require('../models/phones');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/phoneslist',{ useNewUrlParser: true } );

var phone =[
    new phones({
        imagePath:'https://i-cdn.phonearena.com/images/phones/69193-specs/Apple-iPhone-X.jpg',
        title:'iphone x',
        description:'very nice phone',
        price: 800}),

];

for(var x=0;x<phone.length;x++){
    phone[x].save(function (err, result) {
        if(x==phone.length-1){
            mongoose.disconnect();
        }
    });
}

