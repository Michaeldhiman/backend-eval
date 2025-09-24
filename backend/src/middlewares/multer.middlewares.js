
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const isLoggedIn = async(req, _, next)=>{
    // if user have cookies data then get the data
    // if data is wrong throw error
    // return req.user
    const token = req.cookies.token || req.headers['token']?.replace("Barrer ", "");
    // console.log(token);
    try {
        if(!token){
            throw new ApiError(401, "User must be logged in");
        }

        const decoded = jwt.verify(token, config.accessTokenSecret);

        if(!decoded){
            throw new ApiError(401, "User token is invalid");
        }

        const user = await User.findById(decoded?._id).select("-password");

        req.user = user;

    } catch (error) {
        throw error;
    }
    next();
}
