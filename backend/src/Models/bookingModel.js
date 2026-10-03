import mongoose from "mongoose";
const bookingScheme = new mongoose.Schema({
    property:{
        type:mongoose.Schema.ObjectId,
        ref:"Property",
        required:[true,"Booking must belong to a Property"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:[true,"Booking must belong to a user"]
    },
    price:{
        type:Number,
        required:[true,"Booking must have price"]
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    paid:{
        type:Boolean,
        default:false
    },
    orderId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
        default: "PENDING"
    },
    fromDate:{
        type:Date
    },
    toDate:{
        type:Date
    },
    guests:{
        type:Number
    },
    numberOfnights:{
        type:Number
    }
},{timestamps:true});

bookingScheme.pre(/^find/,function(){
    this.populate("user");
    this.populate({
        path:"property",
        select: "maximumGuest images propertyName address"
    });

})
const Booking = mongoose.model("Booking",bookingScheme)

export {Booking}

