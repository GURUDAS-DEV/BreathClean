import mongoose, { Document, Schema } from "mongoose";

// --- Main BreakPoint Interface ---

export interface IBreakPoint extends Document {
  routeId: mongoose.Types.ObjectId; // Reference to the parent Route document
  routeOptionIndex: number; // Index of the specific route option (0, 1, 2...)
  pointIndex: number; // Index of this point in the sequence (0, 1, 2...)

  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// --- Schema ---

const pointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

const breakPointSchema = new Schema<IBreakPoint>(
  {
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      index: true,
    },
    routeOptionIndex: {
      type: Number,
      required: true,
    },
    pointIndex: {
      type: Number,
      required: true,
    },
    location: {
      type: pointSchema,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for geospatial queries (finding points near a location)
breakPointSchema.index({ location: "2dsphere" });

// Index for retrieving all points for a specific route option
breakPointSchema.index({ routeId: 1, routeOptionIndex: 1 });

const BreakPoint = mongoose.model<IBreakPoint>("BreakPoint", breakPointSchema);

export default BreakPoint;
