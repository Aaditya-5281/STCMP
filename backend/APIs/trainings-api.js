const exp = require("express");
const expressAsyncHandler = require("express-async-handler");
const { ObjectId } = require('mongodb');

const trainingApp = exp.Router();

trainingApp.use((req, res, next) => {
  trainingscollection = req.app.get("trainingscollection");
  next();
});

trainingApp.post(
  "/create",
  expressAsyncHandler(async (req, res) => {
    const newTraining = req.body;
    try {
      // Check for duplicate training based on training name
      const dbtraining = await trainingscollection.findOne({ trainingName: newTraining.trainingName });
      if (dbtraining !== null) {
        return res.status(400).send({ message: "Training already exists" });
      }
      // Insert new training
      const result = await trainingscollection.insertOne(newTraining);
      res.status(201).json({ message: "Training created", trainingId: result.insertedId });
    } catch (error) {
      res.status(400).send({ message: "Error creating training", error: error.message });
    }
  })
);

trainingApp.get(
  "/trainings",
  expressAsyncHandler(async (req, res) => {
    //get articlescollection from express app
    const trainingscollection = req.app.get("trainingscollection");
    //get all articles
    let trainingsList = await trainingscollection
      .find()
      .toArray();
    //send res
    res.send({ message: "Trainings", payload: trainingsList });
  })
);

trainingApp.get(
  "/trainings/:facultyId",
  expressAsyncHandler(async (req, res) => {
    //get articlescollection from express app
    const facultyId =req.params.facultyId;
    const trainingscollection = req.app.get("trainingscollection");
    //get all articles
    let trainingsList = await trainingscollection
      .find({programCoordinator:facultyId})
      .toArray();
    //send res
    res.send({ message: "Trainings", payload: trainingsList });
  })
);

trainingApp.get(
  "/trainingsbyyear/:year",
  expressAsyncHandler(async (req, res) => {
    //get articlescollection from express app
    const year = parseInt(req.params.year);
    const trainingscollection = req.app.get("trainingscollection");
    //get all articles
    let trainingsList = await trainingscollection
      .find({endYear:year})
      .toArray();
    //send res
    res.send({ message: "Trainings", payload: trainingsList });
  })
);

trainingApp.get(
  "/gettrainings/:id",
  expressAsyncHandler(async (req, res) => {
    const trainingId = req.params.id;
    const trainingscollection = req.app.get("trainingscollection");

    try {
      // Find the training by ID
      const training = await trainingscollection.findOne({"_id": new ObjectId(trainingId)});
      if (training) {
        res.send({ message: "Training found", payload: training });
      } else {
        res.status(404).send({ message: "Training not found" });
      }
    } catch (error) {
      console.error("Error fetching training details:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  })
);

trainingApp.put(
  "/updatetraining/:id",
  expressAsyncHandler(async (req, res) => {
    const trainingId = req.params.id;
    const updatedTraining = { ...req.body };
    try {
      // Ensure _id field is not included in the update object
      delete updatedTraining._id;
      // Update the training details in the database
      const result = await trainingscollection.updateOne(
        { "_id": new ObjectId(trainingId) },
        { $set: updatedTraining }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Training details updated successfully" });
      } else {
        res.status(404).json({ message: "Training not found or no changes made" });
      }
    } catch (error) {
      console.error('Error updating training details:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

trainingApp.delete(
  "/deletetrainings/:id",
  expressAsyncHandler(async (req, res) => {
    const trainingId = req.params.id;
    const trainingscollection = req.app.get("trainingscollection");

    try {
      // Delete the training by ID
      const deleteResult = await trainingscollection.deleteOne({"_id": new ObjectId(trainingId)});
      
      if (deleteResult.deletedCount === 1) {
        res.send({ message: "Training deleted successfully" });
      } else {
        res.status(404).send({ message: "Training not found" });
      }
    } catch (error) {
      console.error("Error deleting training:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  })
);


module.exports = trainingApp;
