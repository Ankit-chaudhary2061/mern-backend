import mongoose from "mongoose"

const gallarySchema = new mongoose.Schema({
  image: [
    {
      path: {
        type: String,
        required: true,
        trim: true
      },
      publicId: {
        type: String,
        required: true
      }
    }
  ]
});

const Gallary = mongoose.model("Gallary", gallarySchema);
export default Gallary;