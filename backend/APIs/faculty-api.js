const exp = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcryptjs = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const facultyApp = exp.Router();

let facultycollection ;
facultyApp.use((req, res, next) => {
    req.facultycollection = req.app.get("facultycollection");
    next();
});

facultyApp.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const newUser = req.body;
    try {
      const dbuser = await req.facultycollection.findOne({ userId: newUser.userId });
      if (dbuser !== null) {
        res.send({ message: "User existed" });
      } else {
        const hashedPassword = await bcryptjs.hash(newUser.password, 10); // Hash the password from newUser, not userCred
        const newUserObj = {
          userId : newUser.userId ,
          userName: newUser.userName,
          password: hashedPassword,
        };
        // Create user
        await req.facultycollection.insertOne(newUserObj);
        res.send({ message: "User registered successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    }
  })
);



facultyApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const userCred = req.body;
    const dbUser = await req.facultycollection.findOne({ userId: userCred.userId });
    if (dbUser === null) {
        return res.send({ message: "Invalid userId" });
    }else {
      const status = await bcryptjs.compare(userCred.password, dbUser.password);
      if (status === false) {
        return res.send({ message: "Invalid password" });
      }
      const signedToken = jwt.sign(
        { userId: dbUser.userId },
        process.env.SECRET_KEY,
        { expiresIn: "10m" }
      );
      res.send({
        message: "Login success",
        token: signedToken,
        user: dbUser,
      });
    }
  })
);

facultyApp.get('/facultyList', expressAsyncHandler(async (req, res) => {
  try {
      const facultyList = await req.facultycollection.find().toArray();
      res.send({ faculty: facultyList });
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
  }
}));


module.exports = facultyApp;
