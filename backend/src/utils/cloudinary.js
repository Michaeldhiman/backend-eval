import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import fs from "fs";

cloudinary.config({ 
  cloud_name: config.cloudinaryCloudName, 
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret
});

export const upload = async(localPath)=>{
    // upload it to cloudinary
    // if some error comes delete the file
    // After uploading also delete the file from the server
    try {
        if(!fs.existsSync(localPath)){
            return null;
        }
        const result = await cloudinary.uploader.upload(localPath, {
            resource_type:"auto"
        });
        if(result){
            fs.unlinkSync(localPath);
            return result;
        }
        return null;
    } catch (error) {
        fs.unlinkSync(localPath);
        console.log("Cloudinary error: ",error);
        
        return null;
    }
}