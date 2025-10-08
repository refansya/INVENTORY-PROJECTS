import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (!user) {
      return res.status (401).json({success:false, message: "user not found"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({success:false, message: "invalid credentials"});
    }
    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

    return res.status(200).json({success: true, message: "Login successful", token, user: {id: user._id, name: user.name, email: user.email, role: user.role}})
  }catch (error){
    return res.status(500).json({success: false, message: "Internal server error"});
  }
}

export {login};