import bcrypt from "bcrypt";
import User from "../models/User.js";

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, divisi, role } = req.body;

    // cek email unik
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      divisi,
      role,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, divisi, role } = req.body;

    let updateData = { name, email, divisi, role };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User updated", user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

const getMe = async (req, res) => {
  try {
    // req.user.id diset oleh authMiddleware dari token
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }
    res.json({ 
        success: true, 
        user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            divisi: user.divisi, 
            role: user.role 
        } 
    });
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, password, divisi } = req.body;

    let updateData = { name, divisi };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUsers, addUser, updateUser, deleteUser, getMe, updateMe };
