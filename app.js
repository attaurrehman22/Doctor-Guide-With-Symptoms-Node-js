const express = require("express");
const mongoose = require("mongoose");
const Doctor = require("./models/doctorModel");
const Users = require("./models/userModel");
const Symptom = require("./models/symptomsModel");
const BodyParts = require("./models/bodypartsModel");
const router = express.Router();
const BodyPart = require("./models/bodypartsModel");
const BodyPartSymptoms = require("./models/bodypartsymptoms");
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
    const searchEmail = await Doctor.findOne({ email: req.body.email });
    if (searchEmail) {
      res.status(200).json("exist");
    } else {
      const newDoctor = await Doctor.create(req.body);

      const symptomsCollection = mongoose.connection.collection("Body Parts");
      const getbodyparts = await symptomsCollection.findOne({
        name: req.body.speciality,
      });

      const selectedSymptoms = req.body.checkboxes.map(
        (checkbox) => checkbox.sympname
      );

      const symptomPromises = selectedSymptoms.map(async (symptom) => {
        const sympCollection = mongoose.connection.collection("symptoms");
        const getsympname = await sympCollection.findOne({ name: symptom });
        return getsympname._id;
      });

      const symptomIds = await Promise.all(symptomPromises);

      console.log("symptomIds", symptomIds);
      console.log("new Doctor Id", newDoctor._id);

      await Doctor.updateOne(
        { _id: newDoctor._id },
        { $push: { symptomsid: { $each: symptomIds } } }
      );

      res.status(200).json(newDoctor);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/doctordata", async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "_id");

    const doctorDataPromises = doctors.map(async (doctor) => {
      const dataWithSymptoms = await getDatawithSymptoms(doctor._id);
      return { _id: doctor._id, dataWithSymptoms };
    });

    const completeDoctorData = await Promise.all(doctorDataPromises);

    res.json(completeDoctorData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getDatawithSymptoms(doctorId) {
  const doctor = await Doctor.findById(doctorId).populate("symptomsid");
  console.log(doctor);
  if (!doctor) {
  }
  const symptomIds = doctor.symptomsid.map((symptom) => symptom._id);
  const symptoms = await Symptom.find({ _id: { $in: symptomIds } });
  return { doctor, symptoms };
}

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
    // Find the doctor by ID
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
    // Find the doctor by ID
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

// app.post('/save', async (req, res) => {
//   try {
//     const { bodyPart, symptoms } = req.body;
//     const doctorlist = await BodyPart.find({name:bodyPart});

//     if(doctorlist.length>0){
//       res.status(500).json({message:"Exist"})
//     }
//     else{
//       const newBodyPart = new BodyPart({ name:bodyPart });
//       const check=await newBodyPart.save();

//     console.log("Symptoms = ",symptoms)

//       const newBodyPartsymptoms = new BodyPartSymptoms({ name:symptoms });
//       const checksymp=await newBodyPartsymptoms.save();
//       res.status(200).json(checksymp)
//     }

//   } catch (error) {
//     res.status(500).json({ error: "Error saving data" });
//   }
// });

app.post("/save", async (req, res) => {
  try {
    const { bodyPart, symptoms } = req.body;

    // Check if the body part already exists
    const existingBodyPart = await BodyPart.findOne({ name: bodyPart });

    if (existingBodyPart) {
      res.status(409).json({ message: "Body part already exists" });
    } else {
      // Create a new body part
      const newBodyPart = new BodyPart({ name: bodyPart });
      const getbody = await newBodyPart.save();
      console.log("getbody", newBodyPart);

      const symptomObjects = symptoms.map(
        (symptomName) => new Symptom({ bid: getbody._id, name: symptomName })
      );
      const savedSymptoms = await BodyPartSymptoms.insertMany(symptomObjects);

      // Associate the saved symptoms with the new body part
      newBodyPart.symptoms = savedSymptoms.map((symptom) => symptom._id);
      await newBodyPart.save();

      res.status(200).json({ message: "Data saved successfully" });
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
    const getbodypart = await BodyPart.find({});
    if (getbodypart) {
      // console.log("getbodypart",getbodypart)
    }
    res.status(200).json(getbodypart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.get('/getdoctorlist/', async (req, res) => {
//   try {
//     const { sympname } = req.query;
//     console.log(sympname)

//     if (!sympname) {
//       return res.status(400).json({ message: 'Invalid input. sympname parameter is missing.' });
//     }

//     const sympnameArray = sympname.split(',');

//     const doctors = await BodyPartSymptoms.find({ name: { $in: sympnameArray } });

//     console.log("doctors",doctors)

//    const doctors_bid=doctors.map((doc)=>{
//     console.log("doctors_bid",doc.bid)
//     const doctorsList =Doctor.find({ symptomsid: { $oid: doc.bid } });
//     console.log("doctors list that i want",doctorsList)
//    })

//     res.status(200).json({ doctors });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

app.get("/getdoctorlist/", async (req, res) => {
  try {
    const { sympname } = req.query;

    if (!sympname) {
      return res
        .status(400)
        .json({ message: "Invalid input. sympname parameter is missing." });
    }

    const sympnameArray = sympname.split(",");

    const doctorsArray = [];

    for (const symptom of sympnameArray) {
      const symptomDoctors = await getDoctorsForSymptom(symptom);
      doctorsArray.push({ symptom, doctors: symptomDoctors });
    }

    res.status(200).json({ doctors: doctorsArray });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getDoctorsForSymptom(symptom) {
  console.log("-------------", symptom);
  const doctors = [];

  const symptomDocs = await BodyPartSymptoms.find({ name: symptom });

  const symptomIds = symptomDocs.map((doc) => doc.bid); // Extract the ObjectIDs from symptomDocs
  console.log("symptomDocs       ----- bid", symptomIds);

  const newnew = await Doctor.find({});
  for (const doctor of newnew) {
    console.log("Doctor:", doctor.name);
    console.log("symptomsid:");

    for (const symptomId of doctor.symptomsid) {

      const doctorsList = await Doctor.find({ symptomsid: { $in: symptomId } });
      console.log("doctors list that I want", doctorsList);
      doctors.push(...doctorsList);

    }
  }

  // const doctorsList = await Doctor.find({ symptomsid: { $in: symptomIds } });
  // console.log("doctors list that I want", doctorsList);
  // doctors.push(...doctorsList);

  return doctors;
}

// app.get('/getdoctorlist/', async (req, res) => {
//   try {
//     const { sympname } = req.query;

//     if (!sympname) {
//       return res.status(400).json({ message: 'Invalid input. sympname parameter is missing.' });
//     }

//     const sympnameArray = sympname.split(',');

//     const doctors = await BodyPartSymptoms.find({ name: { $in: sympnameArray } });

//     const doctorsListPromises = doctors.map(async (doc) => {
//       console.log("doctors_bid", doc.bid);

//       // Convert the array of string ObjectIds to an array of actual ObjectId objects
//       const symptomIds = doc.bid(id => mongoose.Types.ObjectId(id));

//       const doctorsList = await Doctor.find({ symptomsid: { $oid: symptomIds } });
//       console.log("doctors list that I want", doctorsList);
//       return doctorsList;
//     });

//     const doctorsListResults = await Promise.all(doctorsListPromises);

//     res.status(200).json({ doctors: doctorsListResults });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
