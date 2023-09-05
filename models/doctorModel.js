
const { Int32 } = require('mongodb');
const mongoose=require('mongoose')

const doctorSchema=mongoose.Schema({
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
    hospitalname:{
        type:String,
        required:[true,"Please Enter Hospital Name"]
    },
    city:{
        type:String,
        required:[true,"Please Enter City"]
    },
    speciality:{
        type:String,
        required:[true,"Please Enter Speciality"]
    },
    role:{
        type:String
    },
    specializationid:{
      
    },
    active:{
        type:String
    },
    symptomsid:{
        
    }
})

const Doctors=mongoose.model('Doctors',doctorSchema,'Doctors')
module.exports=Doctors;