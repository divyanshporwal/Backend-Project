import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: env.process.CLOUDINARY_CLOUD_NAME,
  api_key: env.process.CLOUDINARY_CLOUD_KEY,
  api_secret: env.process.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if( !localFilePath ) return null;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log ("file is uploaded on cloudinary " , response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}