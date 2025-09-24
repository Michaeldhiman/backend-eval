import * as dotenv from "dotenv";
dotenv.config({path:"../.env.local"});

export const config = {
    mongoDbURI: String(process.env.MONGODB_URI),
    port:String(process.env.PORT),
    accessTokenSecret:String(process.env.JWT_ACCESS_TOKEN_SECRET),
    accessTokenExpiryDate:String(process.env.JWT_ACCESS_TOKEN_EXPIRY_DATE),
    cloudinaryApiKey: String(process.env.CLOUDINARY_API_KEY),
    cloudinaryApiSecret: String(process.env.CLOUDINARY_API_SECRET),
    cloudinaryCloudName: String(process.env.CLOUDINARY_CLOUD_NAME)
}