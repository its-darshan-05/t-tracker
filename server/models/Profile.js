import mongoose from "mongoose";


const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    factoryName: { type: String, required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },

    commodityType: {
      type: String,
      enum: ["Tea", "Coffee"],
      required: true
    },

    pricePerKilo: { type: Number, required: true },
    effectiveDate: { type: Date, required: true },
    operatingHours: { type: String, required: true }
  },
  {
    timestamps: true // 👈 creates createdAt & updatedAt
  }
);



export default mongoose.model("Profile", profileSchema);
