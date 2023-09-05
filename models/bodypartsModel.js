
const { Int32 } = require('mongodb');
const mongoose=require('mongoose')

const bodypartsSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Name"]
    },
    specialization:{
        // type: mongoose.Schema.Types.ObjectId,
    },
    bodyPart:{
        type:String
    }
    

    
})

const BodyPart=mongoose.model('Body Parts',bodypartsSchema,'Body Parts')
module.exports=BodyPart;