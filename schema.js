const mongoose=require('mongoose')

const userschema = new mongoose.Schema({
    email: {
        type:String,
        required: true
    },
    username: {
        type : String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    history: {
        type: String
    }
})


//userschemma exported as name users
module.exports= new mongoose.model('users',userschema)
