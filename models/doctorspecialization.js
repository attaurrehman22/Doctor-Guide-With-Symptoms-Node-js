


const mongoose=require('mongoose')

const docSpsSchema=mongoose.Schema({
    specialization:{
         type:String
    }
    

    
})

const docsps=mongoose.model('Doctor Specialization',docSpsSchema,'Specialization')
module.exports=docsps;