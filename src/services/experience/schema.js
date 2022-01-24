import mongoose from "mongoose";
import mongoose_csv from "mongoose-csv";

const {Schema, model} = mongoose;

const ExperianceSchema = new Schema(
    {
        role: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        position: { type: String, required: true },
        
     
    },
      {
        timestamps: true
      }

    
)

export default model("Experience",ExperianceSchema)
