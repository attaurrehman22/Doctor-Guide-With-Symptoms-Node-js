
const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Name"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Password"]
    },
    role:{
        type:String
    }
})

const Users=mongoose.model('Users',userSchema,'Users')
module.exports=Users;