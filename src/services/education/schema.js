import mongoose from "mongoose";
import mongoose_csv from "mongoose-csv";

const {Schema, model} = mongoose;

const EducationSchema = new Schema(
    {
        
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        course: { type: String, required: true },
        userID: {type: Schema.Types.ObjectId,required:true, ref:"User"}
        
     
    },
      {
        timestamps: true
      }

    
)

export default model("Education",EducationSchema)
