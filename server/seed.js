import bcrypt from "bcrypt";
import User from "./models/User.js";
import connectDB from "./db/connection.js";

const register = async () => {
  try {
    connectDB();
    const hashPassword = await bcrypt.hash("admin", 10);
    const newUser = new User({
      name: "refan",
      email: "refan@gmail.com",
      password: hashPassword,
      address: "refan address",
      role: "admin"
    })

    await newUser.save();
    console.log("Admin user created succesfully");
  } catch(error) {
    console.log(error);
  }
}


register();