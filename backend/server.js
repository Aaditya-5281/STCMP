const exp = require('express');
const app = exp();
require('dotenv').config(); //process.env.PORT
const mongoClient = require('mongodb').MongoClient;
const path = require('path');
const cors = require('cors');

// Deploy React build in this server
app.use(exp.static(path.join(__dirname,'../client/build')))
//to parse the body of req
app.use(exp.json())

app.use(cors());

mongoClient.connect(process.env.DB_URL)
    .then(client => {
        // Get db obj
        const vnrdb = client.db('vnrdb');
        // Get collection obj
        const trainingscollection = vnrdb.collection('trainingscollection');
        const facultycollection = vnrdb.collection('facultycollection');
        // Share collection obj with express app
        app.set('trainingscollection', trainingscollection);
        app.set('facultycollection', facultycollection);
        // Confirm db connection status
        console.log("DB connection success");
    })
    .catch(err => console.log("Err in DB connection", err));


// Import API routes
const trainingApp = require('./APIs/trainings-api');
const facultyApp = require('./APIs/faculty-api');

// If path starts with training-api, send req to trainingApp
app.use('/trainings-api', trainingApp);

// If path starts with faculty-api, send req to facultyApp
app.use('/faculty-api', facultyApp);

// Deals with page refresh
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Express error handler - Move it to the end
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

// Assign port number
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Web server on port ${port}`));
