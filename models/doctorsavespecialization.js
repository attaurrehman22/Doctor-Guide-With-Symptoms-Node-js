


const mongoose=require('mongoose')

const docSpsSchema=mongoose.Schema({
    specialization:{
         type:String
    },
    doctorId:{

    },
    sympname:{

    },
    specializationid:{
        
    }
    

    
})

const docsps=mongoose.model('Doctor Save Specialization',docSpsSchema,'Doctor Specialization')
module.exports=docsps;