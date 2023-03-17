const Product = require("./Product");
const mongodb = require("mongodb");
const { getDb } = require("../util/database");

class User {
    constructor(name, email, password){
        this.name = name;
        this.email = email;
        this.password = password;
    }

    static save(){
        const db = getDb() 
        return db.collection('users').insertOne(this);
    }

    static findById(id){
        const db = getDb();
        const user = db.collection("users").findOne({_id: new mongodb.ObjectId(id)});
        return user;
    }
}

module.exports = User;