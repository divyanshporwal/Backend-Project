import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";

const registerUser = asyncHandler( async (req,res)=>{
    const {userName, fullName, email ,password } =req.body;
    console.log("email :" ,email);
    res.send(email);
    // if(fullName===""){
    //     throw new ApiError(404, "Your fullName is required");        
    // }
    if(
        [userName,fullName,email,password].some((field)=> field ?.trim()==="") //check your all entities in one go
    ){
        throw new ApiError(404, "All fiels are compulsory ")
    }
    const userExist= await User.findOne({
        $or: [ {userName} , {email}]
    })

    if(userExist){
        throw new ApiError(409, "User with this email or userName already exists ")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path? path.resolve(req.files.avatar[0].path)
  : undefined;
    const coverImageLocalPath = req.files?.coverImage[0]?.path?path.resolve(req.files.coverImage[0].path)
  : undefined;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required 400");
    }

    console.log(avatarLocalPath)
    console.log("req.files:", req.files);
    console.log("avatarLocalPath:", avatarLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    

    if(!avatar){
        throw new ApiError(400 , "Avatar file is required 402")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiError(500, "Something went while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(200,{userCreated}, "User registered Successfully ")
    )
})

export {registerUser};