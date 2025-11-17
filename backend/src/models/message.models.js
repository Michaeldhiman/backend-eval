import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message:{
        type: String,
        trim:true,
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    user2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps:true});

export const Message = mongoose.model("Message", messageSchema);