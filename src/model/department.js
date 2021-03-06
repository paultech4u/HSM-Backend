import mongoose from "mongoose";
const { Schema } = mongoose;

const DEPARTMENT_SCHEMA = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: "Hospitals",
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Admins",
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Departments", DEPARTMENT_SCHEMA);
