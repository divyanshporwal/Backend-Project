import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user= await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken=refreshToken;
        user.save({validationBeforeSave: false})
        return {accessToken, refreshToken}
    }
    catch{
        throw new ApiError(500, "Something went wrong while generating the refresh and access token")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    const {userName, fullName, email ,password } =req.body;
    //console.log(req.body);
    //res.send(req.body);
    // if(fullName===""){
    //     throw new ApiError(404, "Your fullName is required");        
    // }
    if(
        [userName,fullName,email,password].some((field)=>field ?.trim()==="") //check your all entities in one go
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

    // console.log(avatarLocalPath)
     //console.log("req.files:", req.files);
    // console.log("avatarLocalPath:", avatarLocalPath);
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
    console.log("User registered Successfully ")
    return res.status(201).json(
        new ApiResponse(200,{userCreated}, "User registered Successfully ")
       
    )

})

const loginUser = asyncHandler(async (req,res) => {
    // get data from req.body
    // username or email
    // password check
    // provide access and refresh token to user and db
    // send cookie

    const {email,userName,password} = req.body;

    console.log(req.body)

    if(!userName && !email){ 
        throw new ApiError(400, "username or email is required ")
    }

    const user = await User.findOne({
        $or: [{userName} ,{email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user Credentials ")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //pass nd refreshTok and given to user

    const options ={
        httpOnly: true,
        secure: true  //cookies will only modify by server not by frontend
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        }
    )

    const options ={
        httpOnly: true,
        secure: true  //cookies will only modify by server not by frontend
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token ")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used ")
        }
    
        const options ={
            httpOnly:true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" ,accessToken, options)
        .cookie("refreshToken" ,newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }



})

export {registerUser,loginUser, logoutUser, refreshAccessToken};