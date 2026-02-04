import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true 
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
  coverImage: {
  type: {
    path: {
      type: String,
      required: true,
      trim: true
    },
    publicId: {
      type: String,
      required: true
    }
  },
  required: true
},
 image: {
  type: {
    path: {
      type: String,
      required: true,
      trim: true
    },
    publicId: {
      type: String,
      required: true
    }
  },
  required: true
},
isFeatured:{
    type:Boolean,
    default:false
},

  category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category", 
  required: true
},
brand: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Brand",
  required: true
}


  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;