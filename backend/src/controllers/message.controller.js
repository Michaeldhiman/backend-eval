import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

export const create = asyncHandler(async(req, res)=>{
    // find the room or check if any value is not-defined then throw error
    // return the message with user details and room details
    const {_id} = req.user;
    const {message, user2Id} = req.body;
    // console.log(user2Id, message);
    
    if(!message){
        throw new ApiError(401, "All feilds are required");
    }

    const user2 = await User.findById(user2Id);
    if(!user2){
        throw new ApiError(402, "User is not defined")
    }
    
    const newMessage = await Message.create({
        message,
        user:_id,
        user2:user2?._id
    });
    const messageToSent = await Message.aggregate([
        {
            $match:{
            _id: newMessage?._id
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'user',
                foreignField:'_id',
                as: 'user_details',
                pipeline:[{
                    $project:{
                        username:1,
                        email:1,
                        pic:1,
                        picPublicId:1,
                    }
                }]
            }
        },
        {
            $lookup:{
                from:'users',
                localField:'user2',
                foreignField:'_id',
                as: 'user2_details',
                pipeline:[{
                    $project:{
                        username:1,
                        email:1,
                        pic:1,
                        picPublicId:1,
                    }
                }]
            }
        },
        {
            $addFields:{
                user:{
                    $first:'$user_details'
                },
                user2:{
                    $first:'$user2_details'
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {message:messageToSent[0]}, "Message with details sent successfully")
    );
});

export const getUsersMessages = asyncHandler(async(req, res)=>{
    // check if secound user exists
    // If it does exists then find the chats of both of these persons
    const currUser = req.user;
    const otherUserId = req.params.id;
    // console.log(otherUserId);
    
    const otherUser = await User.findById(otherUserId);
    if(!otherUser){
        throw new ApiError(402, "Other user doesn't exists");
    }
    const userMessages = await Message.find({user:currUser?._id, user2:otherUser._id});
    const otherUserMessages = await Message.find({user:otherUser._id, user2:currUser?._id});
    return res.status(200).json(
        new ApiResponse(200, {currUserMessages:userMessages, otherUserMessages:otherUserMessages}, "User and other user messages retrived")
    );
});

export const deleteMessage = asyncHandler(async(req, res)=>{
    // Findthe message and check if exists
    // Check if curr user is the owner.
    // if he is delete the message
    // respone the data i.e success
    const _id = req.params?._id;
    const message = await Message.findById(_id).populate("user");
    if(!message){
        throw new ApiError(403, "Invaliid message id!!!");
    }
    const user = req.user;
    if(message?.user?._id?.toString()!==user?._id?.toString()){
        throw new ApiError(401, "User is not the owner!!!");
    }
    const currDate = new Date();
    if(currDate?.getTime()-message?.createdAt.getTime()>5*60*1000){
        throw new ApiError(402, "Message is outdated to update");
    }
    await Message.findByIdAndUpdate(message?._id, {$set:{message:""}});
    return res.status(200).json(
        new ApiResponse(200, {success:true}, "message deleted successfully")
    );
    
});

export const updateMessage = asyncHandler(async(req, res)=>{
    // check if message exists
    // check if user is the owner
    // check if message is older than 5 min
    // update the message
    const messageContent = req.body.message;
    const messageId = req.params?._id;
    const message = await Message.findById(messageId).populate("user");
    if(!message){
        throw new ApiError(403, "Invalid message id!!!");
    }
    if(message?.message === ""){
        throw new ApiError(402, "Message is already deleted");
    }
    const user = req.user;
    if(message?.user?._id?.toString()!==user?._id?.toString()){
        throw new ApiError(401, "User is not the owner!!!");
    }
    const currDate = new Date();
    if(currDate?.getTime()-message?.createdAt.getTime()>5*60*1000){
        throw new ApiError(402, "Message is outdated to update");
    }
    const updatedMessage = await Message.findByIdAndUpdate(messageId, {$set:{message:messageContent}});
    return res.status(200).json(
        new ApiResponse(200, {message:updatedMessage, success:true}, "Message updated successfully")
    );
});