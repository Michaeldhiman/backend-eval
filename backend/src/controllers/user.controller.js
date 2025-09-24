import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../utils/cloudinary.js";

export const signup = asyncHandler(async(req, res)=>{
    // Singup the user if username, email, passsword is there
    // for the pic check if pic is sent or not if sent then upload it to server
    // Otherwise upload it to cloudinary
    // then save the the url to the server

    const {username, email, password} = req.body;
    const pic = req?.file;
    if(!email || !username || !password){
        throw new ApiError(401, "All feilds are required");
    }
    const user = await User.findOne({email:email});
    if(user){
        throw new ApiError(402, "User already exists");
    }
    let uploadUrl = "";
    let uploadPublicId = "";
    if(pic){
        const result = await upload(pic.path);
        if(result){
            uploadUrl = result.url;
            uploadPublicId = result.public_id;
        }
    }

    const newUser = await User.create({
        username:username,
        email:email,
        password:password,
        pic:uploadUrl,
        picPublicId:uploadPublicId
    });
    if(!newUser){
        throw new ApiError(500, "Something went wrong while creating the user");
    }
    const accessToken = newUser.getAccessToken();

    const userToSent = await User.findById(newUser._id).select("-password");

    const options = {
        httpOnly:false,
        secure:true
    };

    return res.status(200).cookie("token", accessToken, options).json(
        new ApiResponse(200, {user: userToSent, token: accessToken}, "User signed in successfully")
    );
});