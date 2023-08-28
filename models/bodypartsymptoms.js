

const mongoose=require('mongoose')

const bodypartssymptomsSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter Name"]
    },
    bid:{
       
    }
    

    
})

const BodyPartSymptoms=mongoose.model('symptoms',bodypartssymptomsSchema,'symptoms')
module.exports=BodyPartSymptoms;