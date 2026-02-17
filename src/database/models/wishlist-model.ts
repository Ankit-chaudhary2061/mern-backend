import mongoose from "mongoose";


const wishlist_schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Product'
    }
},{timestamps:true})
const WishList = mongoose.model("WishList", wishlist_schema);

export default WishList