const express = require("express");
const mongoose = require("mongoose");
const Doctor = require("./models/doctorModel");
const Users = require("./models/userModel");
const Symptom = require("./models/symptomsModel");
const BodyParts = require("./models/bodypartsModel");
const router = express.Router();
const BodyPart = require("./models/bodypartsModel");
const BodyPartSymptoms = require("./models/bodypartsymptoms");
const Doctor_specialization=require('./models/doctorspecialization')
const Doctor_Save_specialization=require('./models/doctorsavespecialization')
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

app.get("/", (req, res) => {
  res.send("hello node API ..........");
});

mongoose
  .connect("mongodb://0.0.0.0:27017/Doctor_Guide", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.post("/doctor", async (req, res) => {
  console.log("checkboxes", req.body.checkboxes);
  console.log("req ody", req.body);
  
  try {
    const docData=req.body;
    const doc_spc=req.body.speciality;
    const searchEmail = await Doctor.findOne({ email: req.body.email });
    const searchspc = await Doctor_specialization.findOne({ specialization: doc_spc });
    if (searchEmail) {
      res.status(200).json("exist");
    }
    else {
      const Doctor_Data=await Doctor.create(req.body)
      if(searchspc){
       const searchspcID=searchspc._id;
      

          await Doctor.updateOne(
        { _id: Doctor_Data._id },
        { $set: { specializationid:searchspcID } }
      );

      await Doctor.updateOne(
        { _id: Doctor_Data._id },
        { $set: { active:"NOT" } }
      );

      if (Array.isArray(req.body.checkboxes) && req.body.checkboxes.length > 0) {
        const selectedSymptoms = req.body.checkboxes.map(item => ({
          doctorId: Doctor_Data._id,
          specializationid:searchspc._id,
          sympname: item.sympname
        }));
        console.log("---------------------------------selectedSymptoms",selectedSymptoms)
        const new_record=await Doctor_Save_specialization.insertMany(selectedSymptoms);
      }
      

       console.log("Doctor_Data",Doctor_Data)

       res.status(200).json(Doctor_Data);

      }

      // const newDoctor = await Doctor.create(req.body);

      // const symptomsCollection = mongoose.connection.collection("Body Parts");
      // const getbodyparts = await symptomsCollection.findOne({
      //   name: req.body.speciality,
      // });

      // const selectedSymptoms = req.body.checkboxes.map(
      //   (checkbox) => checkbox.sympname
      // );

      // const symptomPromises = selectedSymptoms.map(async (symptom) => {
      //   const sympCollection = mongoose.connection.collection("symptoms");
      //   const getsympname = await sympCollection.findOne({ name: symptom });
      //   return getsympname._id;
      // });

      // const symptomIds = await Promise.all(symptomPromises);

      // console.log("symptomIds", symptomIds);
      // console.log("new Doctor Id", newDoctor._id);

      // await Doctor.updateOne(
      //   { _id: newDoctor._id },
      //   { $push: { symptomsid: { $each: symptomIds } } }
      // );

      res.status(200).json(Doctor_Data);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/doctordata", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    console.log("doctors",doctors)

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.get("/getdoctors", async (req, res) => {
  try {
    const getdoctor = await Doctor.find({});
    if (getdoctor) {
      res.status(200).json(getdoctor);
    } else {
      res.status(500).json({ message: "Empty" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/acceptDoctor", async (req, res) => {
  const { doctorId } = req.body;
  console.log("doctorid", doctorId);

  try {

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    doctor.active = "OK";
    const updatedDoctor = await doctor.save();
    console.log("Updated doctor:", updatedDoctor);
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor status." });
  }
});

app.put("/rejectDoctor", async (req, res) => {
  const { doctorId } = req.body;
  console.log("doctorid", doctorId);

  try {
   
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    doctor.active = "NOT";
    const updatedDoctor = await doctor.save();
    console.log("Updated doctor:", updatedDoctor);
    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor status." });
  }
});

app.post("/user", async (req, res) => {
  console.log("checkboxes", req.body.checkboxes);
  try {
    const searchEmail = await Users.findOne({ email: req.body.email });
    if (searchEmail) {
      res.status(200).json("exist");
    } else {
      const newDoctor = await Users.create(req.body);
      res.status(200).json(newDoctor);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/getuser", async (req, res) => {
  const { email, password } = req.body;
  try {
    const getuser = await Users.find({ email, password });
    if (getuser) {
      res.status(200).json("EXIST");
    } else {
      res.status(500).json({ message: "Empty" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/getbodyparts", async (req, res) => {
  try {
    const getdoctor = await BodyParts.find({});
    if (getdoctor) {
      res.status(200).json(getdoctor);
    } else {
      res.status(500).json({ message: "Empty" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/getsymptoms/:name", async (req, res) => {
  const name = req.params.name;
  console.log("name", name);
  
  try {
    const spec = await Doctor_specialization.findOne({ specialization: name });

    if (spec) {
      const specid = spec._id;
      console.log("specid ID:", specid);
      
      const bodypartdata = await BodyPart.find({ specialization: specid });
      console.log("bodypartdata:", bodypartdata);
      
      if (bodypartdata.length > 0) {
        const symptomsList = [];

        for (const bodypart of bodypartdata) {
          const bodypartdataID = bodypart._id;
          console.log("bodypartdataID ID:", bodypartdataID);
          const getsymp = await Symptom.find({ bid: bodypartdataID });
          symptomsList.push(...getsymp);
        }

        res.status(200).json(symptomsList);
      } else {
        res.status(404).json({ message: "Body part data not found" });
      }
    } else {
      res.status(404).json({ message: "Specialization not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/getdoctorlistofsymptoms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const doctorlist = await Doctor.find({ "symptomsid.oid": { $in: [id] } });
    console.log(doctorlist);
    if (doctorlist.length > 0) {
      res.status(200).json(doctorlist);
    } else {
      res
        .status(404)
        .json({ message: "No doctors found with the given symptomsid" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.post("/save", async (req, res) => {
  try {
    const { bodyPart, specialization, symptoms } = req.body;

    const spsData=await Doctor_specialization.findOne({specialization:specialization})
    console.log("spsData",spsData)

    const existingBodyPart = await BodyPart.findOne({ name: bodyPart });

    if (existingBodyPart) {
      return res.status(409).json({ message: "Body part already exists" });
    }

    const newBodyPart = new BodyPart({ name: bodyPart, specialization:spsData._id });
    const savedBodyPart = await newBodyPart.save();

    const symptomObjects = symptoms.map((symptomName) => new Symptom({ bid: savedBodyPart._id, name: symptomName }));
    const savedSymptoms = await BodyPartSymptoms.insertMany(symptomObjects);

    savedBodyPart.symptoms = savedSymptoms.map((symptom) => symptom._id);
    await savedBodyPart.save();

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving data" });
  }
});





app.post("/saveDoctorSpecialization", async (req, res) => {
  try {
    const { specialization } = req.body;

   
    const existingBodyPart = await BodyPart.findOne({ specialization: specialization });

    if (existingBodyPart) {
      res.status(409).json({ message: "Body part already exists" });
    } else {
  
      const newBodyPart = new Doctor_specialization({ specialization: specialization });
      const getbody = await newBodyPart.save();
      console.log("getbody", getbody);


      res.status(200).json(getbody._id);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving data" });
  }
});



app.get("/getBodyPartsandSymptoms/:name", async (req, res) => {
  console.log(req.params);
  try {
    const bodyPartname = req.params;
    const getbodypart = await BodyPart.find({ name: bodyPartname });
    if (getbodypart) {
      console.log("getbodypart", getbodypart);
    }
    res.status(200).json(getbodypart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/getBodyPart", async (req, res) => {
  try {
    const getbodypart = await Doctor_specialization.find({});
    if (getbodypart) {
    
    }
    res.status(200).json(getbodypart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});







app.get('/getdoctorlist', async (req, res) => {
  const { symptomNames, bodyPartname } = req.query;
  const selectedSymptoms = symptomNames.split(',');


  try {
    const doctors = await Symptom.find({ name: { $in: selectedSymptoms } });

    const uniqueBids = [...new Set(doctors.map(doctor => doctor.bid))];

    const relatedBodyParts = await BodyParts.find({ _id: { $in: uniqueBids } });

    const specializationIds = relatedBodyParts.map(part => part.specialization);

    const relatedDoctors = await Doctor.find({ specializationid: { $in: specializationIds } });

    const relatedSpecializationIds = relatedDoctors.map(doctor => doctor._id);

    const resultArray = [];
    const doctorsList=[];
    for(const doctordata of relatedSpecializationIds){
      let id=0;
       for(const data of selectedSymptoms){
     
        const getOriginalData = await Doctor_Save_specialization.find({
          doctorId: relatedSpecializationIds, 
          sympname: data,      
        });
        
        if(getOriginalData){
          id=id+1;
        }

        if(selectedSymptoms.length===id){

          if(resultArray.length>=0){
            resultArray.push(getOriginalData);
          }
          else{
            resultArray.push(...getOriginalData);
          }
     
        }
       }
    }



    for(const dotorGetData of resultArray){
      for(const newdotorGetData of dotorGetData){
        newList = await Doctor.find({ _id:newdotorGetData.doctorId,
        active:"OK"  });
        doctorsList.push(...newList)
      }
      break;
    }



    res.json(doctorsList);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get("/getsympt/:name", async (req, res) => {
  const name = req.params.name;
  console.log("name",name)
  try {
    const symptom = await BodyPart.findOne({ _id: name });

    if (symptom) {
      const symptomId = symptom._id;
      console.log("Symptom ID:", symptomId);
      const data = await Symptom.find({ bid: symptom._id });
      console.log("data:", data);
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Symptom not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});