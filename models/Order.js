const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {
            type: Object,
            require: true
        },
        quantity: {
            type: Number,
            require: true
        }
    }],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            require: true,
            ref: "user"
        },
        name: { 
            type: String, 
            require: true
        }
    }
});


module.exports = mongoose.model('Order', orderSchema);