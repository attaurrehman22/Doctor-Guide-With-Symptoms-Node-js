const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema({
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: "Body Part", // Reference to the BodyPart model (if you have one)
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

const Symptom = mongoose.model("Symptom", symptomSchema,'symptoms');

module.exports = Symptom;
