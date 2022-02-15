import mongoose from "mongoose";
import bcrypt from "bcrypt"
//import mongoose_csv from "mongoose-csv";
//import ExperianceSchema from '../experience/schema.js'
const { Schema, model } = mongoose;





const UserSchema = new Schema(
    {
     
    
      name: { type: String, required: true },
      job: { type: String, required: true },
      email: { type: String, required: true,unique:true },
      password: { type: String, required: true },
 
    },
    { timestamps: true }
  );
  
  UserSchema.pre("save", async function (done) {
   
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12)
    }
    done();
  });
  
  // static: find using credentials
  
  UserSchema.statics.findByCredentials = async function (email, password) {
  
    const user = await UserModel.findOne({ email })
  
    try {
      if (await bcrypt.compare(password, user.password))
        return user
    } catch { }
  
    return null
  }

  UserSchema.static("findUser", async function (query) {
    const total = await this.countDocuments(query);
    const user = await this.find()
      .limit(query.options.limit)
      .skip(query.options.skip)
      .sort(query.options.sort);
  
    return { total, user };
  });

  const UserModel = mongoose.model("User",UserSchema)
  export default UserModel;