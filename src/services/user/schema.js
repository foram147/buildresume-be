import mongoose from "mongoose";
import bcrypt from "bcrypt"
//import mongoose_csv from "mongoose-csv";
//import ExperianceSchema from '../experience/schema.js'
const { Schema, model } = mongoose;





const UserSchema = new Schema(
    {
     
      //image: { type: String},
      name: { type: String, required: true },
      job: { type: String, required: true },
      //postaladdress: { type: String, required: true },
      email: { type: String, required: true,unique:true },
      password: { type: String, required: true },
      //mobile: { type: Number, required: true },
      //dob: { type: String, required: true },
      //personalstatement: { type: String, required: true },
      //skills: { type: String },
      //hobbies: { type: String },
      //profile:[{type:mongoose.Schema.Types.ObjectId,ref:"Profile"}],
      //experience: [{type:mongoose.Schema.Types.ObjectId,ref:"Experience"}]
      
    },
    { timestamps: true }
  );
  
  UserSchema.pre("save", async function (done) {
    //this.avatar = `https://ui-avatars.com/api/?name=${this.name}+${this.surname}`;
    // hash password
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