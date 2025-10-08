import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {type: String},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  divisi: {type: String},
  role: {type: String, enum:["admin", "karyawan"], default: "karyawan" }
},{ timestamps: true}
);

const User = mongoose.model("User", userSchema);
export default User;