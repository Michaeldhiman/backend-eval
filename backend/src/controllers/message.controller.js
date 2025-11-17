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