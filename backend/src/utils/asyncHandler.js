import { ApiResponse } from "./ApiResponse.js";
export const asyncHandler = (fn)=>async(req, res, next)=>{
    try {
        return await fn(req, res, next);
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json(new ApiResponse(error?.statusCode || 500, null, error?.message || "Internal server error"));
    }
}