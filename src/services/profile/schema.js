import mongoose from "mongoose";
import Experience from "../experience/schema.js";
import User from "../user/schema.js";
//import mongoose_csv from "mongoose-csv";
//import ExperianceSchema from '../experience/schema.js'
const { Schema, model } = mongoose;


const EducationSchema = new mongoose.Schema( {
        
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    course: { type: String, required: true },
    
 
},
  {
    timestamps: true
  }
  )


const ProfileSchema = new Schema(
    {
      user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      image: { type: String},
      //name: { type: String, required: true },
      //job: { type: String, required: true },
      postaladdress: { type: String, required: true },
      //email: { type: String, required: true },
      //password: { type: String, required: true },
      mobile: { type: Number, required: true },
      dob: { type: String, required: true },
      personalstatement: { type: String, required: true },
      skills: { type: String },
      hobbies: { type: String },
      education:{default:[],type:[EducationSchema]},
      experience: [{type:mongoose.Schema.Types.ObjectId,ref:"Experience"}]
  },
    { timestamps: true }
  );
  export default model("Profile", ProfileSchema);
 ProfileSchema.pre("save", async function (done){
     try{
         const isExist = await User.findById(this.user)
         if(isExist){
             done()
         } else{
             const error = new Error("this user does not exist")
             error.status = 400
             done(error)
         }

     }catch(error){
         done(error)
     }
 })

 