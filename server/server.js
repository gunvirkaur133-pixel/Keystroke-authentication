const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://gunvirkaur133_db_user:HmYw9RJU88IOijem@ac-fvrnml6-shard-00-00.xb3iz0c.mongodb.net:27017,ac-fvrnml6-shard-00-01.xb3iz0c.mongodb.net:27017,ac-fvrnml6-shard-00-02.xb3iz0c.mongodb.net:27017/?ssl=true&replicaSet=atlas-84sn58-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    keystrokeData: Array
});

const User = mongoose.model("User", UserSchema);


// REGISTER USER
app.post("/register", async (req, res) => {

    console.log(req.body);

    try {

        // Check duplicate username
        const existingUser = await User.findOne({
            username: req.body.username
        });

        if (existingUser) {
            return res.json("Username already exists ❌");
        }

        // Check duplicate password
        const existingPassword = await User.findOne({
            password: req.body.password
        });

        if (existingPassword) {
            return res.json("Password already used ❌");
        }

        // Save new user
        const user = new User(req.body);

        await user.save();

        console.log("User saved to MongoDB");

        res.json("User Registered Successfully");

    } catch (error) {

        console.log("SAVE ERROR:", error);

        res.status(500).json(error);
    }
});


// GET ALL USERS
app.get("/users", async (req, res) => {

    try {

        const users = await User.find();

        res.json(users);

    } catch (error) {

        console.log(error);

        res.status(500).json(error);
    }
});


// START SERVER
app.listen(5000, () => {
    console.log("Server running on port 5000");
});