import mongoose from "mongoose";
import Experience from "../experience/schema.js";
import User from "../user/schema.js";
//import mongoose_csv from "mongoose-csv";
//import ExperianceSchema from '../experience/schema.js'
const { Schema, model } = mongoose;

const SkillsSchema = new mongoose.Schema( {
  
    skill:{type:String,required:true}
  },
  {
    timestamps: true
  
})
const HobbiesSchema = new mongoose.Schema( {
 
   hobby:{type:String,required:true}
  },
  {
    timestamps: true
  
})

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
      user:{type:Schema.Types.ObjectId,required:true, ref:"User"},
      image: { type: String},
      postaladdress: { type: String, required: true },
      mobile: { type: Number, required: true },
      dob: { type: String, required: true },
      personalstatement: { type: String, required: true },
      skills: {default:[],type:[SkillsSchema]},
      hobbies: {default:[],type:[HobbiesSchema]},
      education:{default:[],type:[EducationSchema]},
      experience: [{type:Schema.Types.ObjectId,ref:"Experience"}]
  },
    { timestamps: true }
  );

  ProfileSchema.static("findByUserId", async function (query) {
    const total = await this.countDocuments(query);
    const profile = await this.find(query.criteria)
      .limit(query.options.limit)
      .skip(query.options.skip)
      .sort(query.options.sort);
  
    return { total, profile };
  });
  
  
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

 