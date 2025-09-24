import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        trim:true,
        required:true,
    },
    email:{
        type: String,
        trim:true,
        required:true
    },
    pic:{
        type:String,
        default:""
    },
    password:{
        type: String,
        trim:true,
        required:true
    },
    picPublicId:{
        type: String,
        trim:true,
        default:""
    },
}, {timestamps:true});

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
    
});

userSchema.methods.getAccessToken = function(){
    const data = {
        _id:this._id,
        email:this.email
    }
    return jwt.sign(data, config.accessTokenSecret, {expiresIn:config.accessTokenExpiryDate});
}

userSchema.methods.isPasswordCorrect = async function(password){
    const result = await bcrypt.compare(password, this.password);
    return result;
}

export const User = mongoose.model("User", userSchema);