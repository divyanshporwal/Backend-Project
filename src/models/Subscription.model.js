import mongoose, {Schema,model} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribed the channel
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one who is subscriber is subscribing
        ref: "User"
    }
},{timestamps:true })

export const subscription= model("Subscription",subscriptionSchema)

