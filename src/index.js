import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from 'express'
import connectDB from "./db/data.js";
import dotenv from 'dotenv'
const app=express();

dotenv.config(
    {
        path:"./.env",
    }
)

connectDB();
console.log("server started")

// const connectDB= (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error",(err)=>{
//             console.log("ERROR: ", err);
//             throw err
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`server is running at PORT: ${process.env.PORT}`);
//         })
//     }
//     catch(err){
//         console.error("ERROR: " ,err);
//         throw err;
//     }
// })

// connectDB();