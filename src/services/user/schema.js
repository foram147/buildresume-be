import mongoose from "mongoose";
//import mongoose_csv from "mongoose-csv";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
    {
     
      image: { type: String},
      name: { type: String, required: true },
      job: { type: String, required: true },
      postaladdress: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: Number, required: true },
      dob: { type: String, required: true },
      personalstatement: { type: String, required: true },
      skills: { type: String, required: true },
      hobbies: { type: String, required: true },
      education: { type: String, required: true },
      
  },
    { timestamps: true }
  );
  
  UserSchema.static("findCVByUserName", async function (query){
    const total = await this.countDocuments(query)
    const user = await this.find(query.criteria)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)

    return{total,user }
  })

  export default model("User", UserSchema);