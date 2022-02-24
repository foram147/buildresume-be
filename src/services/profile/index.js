import express from "express";
import q2m from "query-to-mongo"
import basicMiddleware from "../../utils/auth/basic.js";
import { JwtMiddleware } from "../../utils/auth/jwt.js";
import onlyOwner from "../../utils/auth/onlyOwner.js";
import ProfileSchema from "./schema.js";
import { uploadProfilePicture } from "../../utils/upload/index.js";
import createHttpError from "http-errors";
import { generateCVPDF } from "../../utils/pdf/index.js";
import { pipeline } from "stream";

//import UserModel from "../user/schema.js";
const Profilerouter = express.Router();

// get all profile
Profilerouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const total = await ProfileSchema.countDocuments({})

    const profile = await ProfileSchema.find({...mongoQuery})
    .populate({ path: "user", select: "name email job"})
    .populate({ path: "experience",select:"position role"})

    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort)

    res.send({
      ...(mongoQuery.options.limit && {
        pageAmount: mongoQuery.links(`/profile`, total),
    links: Math.ceil(total/ mongoQuery.options.limit),
  }),
  total,
  profile
});
  } catch (error) {
    console.log({ error });
    res.status(500).send({ message: error.message });
  }
});

////--------------------- post picture
Profilerouter.post(
  "/:id/picture",
  uploadProfilePicture,
  async (req, res, next) => {
    //console.log(req.whatever)
    try {
      console.log(req.file)
      const uploadPicture = await ProfileSchema.findByIdAndUpdate(
        { _id: req.params.id },
        { image: req.file.path },
        { new: true }
      );
      if (uploadPicture) {
        res.send("image uploaded");
      } else {
        next(createHttpError(404, `user id not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);


//------------------- get PDF
Profilerouter.get("/:id/PDF", async (req, res, next) =>{
  try{
        const profile = await ProfileSchema.findById(req.params.id)
        .populate({ path: "user", select: "name email job"})
        .populate({ path: "experience",select:"position role"})
        if(!profile){
          res.status(404)
          .send({message: `user id ${req.params.id} not found`})
        } else{
          //const userValues = Object.values(user)
          const source = await generateCVPDF(profile)
          res.setHeader("Content-Disposition", `attachment; filename= user.pdf`)
          const destination = res;
          pipeline(source, destination,(err)=>{
            if(err) next(err)
          })
        }
  } catch(error){
    next(error)
  }
})

// create  profile
Profilerouter.post(
  "/:userId",
  JwtMiddleware,
  async (req, res, next) => {
    try {
      const newProfile = {...req.body, user: req.user._id}
      console.log(req.body)
      const profile = await new ProfileSchema(newProfile).save();
      
      res.status(201).send(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
);
//////------------------- get by userid
/*Profilerouter.get("/:userId", async (req, res, next) => {
  try {
    const id = req.params.userId
    console.log(id)
    const profile = await ProfileSchema.findOne({user:id})
    .populate({ path: "user", select: "name email job"})
    .populate({ path: "experience",select:"position role"})

        if (!profile) {
      res
        .status(404)
        .send({ message: `profile with  is not found!` });
    } else {
      res.send(profile);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});*/

///////----------------------get by profile id
Profilerouter.get("/:id", async (req, res, next) => {
  try {
    //const id = req.params.id
    console.log(req.params.id)
    const profile = await ProfileSchema.findById(req.params.id)
    .populate({ path: "user", select: "name email job"})
    .populate({ path: "experience",select:"position role"})
    .populate({ path: "skills", select: "skill"})
    .populate({ path: "hobbies", select: "hobby"})

        if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      res.send(profile);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});



// delete  profile
Profilerouter.delete("/:id", JwtMiddleware, onlyOwner, async (req, res, next) => {
  try {
    const profile = req.profile;

    if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      await ProfileSchema.findByIdAndDelete(req.params.id);
      res.status(204).send();
    }
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//  update profile
Profilerouter.put("/:id", async (req, res, next) => {
  try {
    const updated = await ProfileSchema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(updated);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});


///--------------------------- add skills
Profilerouter.post("/:id/skills",async(req,res,next)=>{
  try{
    console.log(req.params.id)
      const profile = await ProfileSchema.findOneAndUpdate(req.params.id);
      
      if(!profile){
        res.status(404)
        .send({message:`profile with ${req.params.id} is not found`})
      } else{
       console.log(profile)
       const updatedProfile = await ProfileSchema.findByIdAndUpdate(
          req.params.id,
          {
            $push:{
              skills:req.body,
            },
          },
          {new:true}
        );
        res.send(updatedProfile)
      }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
});



/// -------------------------- get skills by profile id
Profilerouter.get("/:id/skills", async (req, res, next) => {
  try {
    //const id = req.params.id
    console.log(req.params.id)
    const profile = await ProfileSchema.findById(req.params.id)
   

        if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      res.send(profile.skills);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


//// -------------------------- delete skills
Profilerouter.delete("/:id/skills/:skillId",async (req,res,next)=>{
  try{
    const profile = await ProfileSchema.findById(req.params.id)
    if(!profile){
      res.status(404)
      .send({message:`profile with ${req.params.id} is not found`})
    }else{
      await ProfileSchema.findByIdAndUpdate(
        req.params.id,
        {
          $pull:{
            skills:{_id:req.params.skillId},
          },
          },
          { new : true}
      );
      res.status(204)
      .send({message:`skill ${req.params.skillId} deleted`})
    }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})


///--------------------------- update skills
Profilerouter.put("/:id/skills/:skillId",async(req,res,next)=>{
  try{

    console.log("profile id",req.params.id)
    console.log("skill id", req.params.skillId)
    const profile = await ProfileSchema.findById(req.params.id);
    if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      const skillIndex = profile.skills.findIndex(
        (skills) => skills._id.toString() === req.params.skillId
      );
      if (skillIndex === -1) {
        res.status(404).send({
          message: `skill with ${req.params.skillId} is not found!`,
        });
      } else {
        profile.skills[skillIndex] = {
          ...profile.skills[skillIndex]._doc,
          ...req.body,
        };
        await profile.save();
        res.send(profile.skills);
      }
    }
  }
  catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})


////------------------------------- POST HOBBY
Profilerouter.post("/:id/hobbies",async(req,res,next)=>{
  try{
      const profile = await ProfileSchema.findOneAndUpdate(req.params.id);
      
      if(!profile){
        res.status(404)
        .send({message:`profile with ${req.params.id} is not found`})
      } else{
       console.log(profile)
       const updatedProfile = await ProfileSchema.findByIdAndUpdate(
          req.params.id,
          {
            $push:{
              hobbies:req.body,
            },
          },
          {new:true}
        );
        res.send(updatedProfile)
      }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
});
////------------------------------- GET HOBBY
Profilerouter.get("/:id/hobbies", async (req, res, next) => {
  try {
    //const id = req.params.id
    console.log(req.params.id)
    const profile = await ProfileSchema.findById(req.params.id)


        if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      res.send(profile.hobbies);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
////------------------------------- DELETE HOBBY
Profilerouter.delete("/:id/hobbies/:hobbyId",async (req,res,next)=>{
  try{
    const profile = await ProfileSchema.findById(req.params.id)
    if(!profile){
      res.status(404)
      .send({message:`profile with ${req.params.id} is not found`})
    }else{
      await ProfileSchema.findByIdAndUpdate(
        req.params.id,
        {
          $pull:{
            hobbies:{_id:req.params.hobbyId},
          },
          },
          { new : true}
      );
      res.status(204)
      .send({message:`skill ${req.params.hobbyId} deleted`})
    }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})
////------------------------------- UPDATE HOBBY
Profilerouter.put("/:id/hobbies/:hobbyId",async(req,res,next)=>{
  try{

    console.log("profile id",req.params.id)
    console.log("hobby id", req.params.hobbyId)
    const profile = await ProfileSchema.findById(req.params.id);
    if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      const hobbyIndex = profile.hobbies.findIndex(
        (hobbies) => hobbies._id.toString() === req.params.hobbyId
      );
      if (hobbyIndex === -1) {
        res.status(404).send({
          message: `hobby with ${req.params.hobbyId} is not found!`,
        });
      } else {
        profile.hobbies[hobbyIndex] = {
          ...profile.hobbies[hobbyIndex]._doc,
          ...req.body,
        };
        await profile.save();
        res.send(profile.hobbies);
      }
    }
  }
  catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})

//------------------post education
Profilerouter.post("/:id/education",async(req,res,next)=>{
  try{
      const profile = await ProfileSchema.findOneAndUpdate(req.params.id);
      
      if(!profile){
        res.status(404)
        .send({message:`profile with ${req.params.id} is not found`})
      } else{
       
       const updatedProfile = await ProfileSchema.findByIdAndUpdate(
          req.params.id,
          {
            $push:{
              education:req.body,
            },
          },
          {new:true}
        );
        res.send(updatedProfile)
      }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
});


//------------ get Education 
Profilerouter.get("/:id/education", async (req, res, next) => {
  try {
    //const id = req.params.id
    console.log(req.params.id)
    const profile = await ProfileSchema.findById(req.params.id)
  

        if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      res.send(profile.education);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


//----------------- get education by education Id



//------------------ edit education
Profilerouter.put("/:id/education/:educationId",async(req,res,next)=>{
  try{

    console.log("profile id",req.params.id)
    console.log("education id", req.params)
    const profile = await ProfileSchema.findById(req.params.id);
    if (!profile) {
      res
        .status(404)
        .send({ message: `profile with ${req.params.id} is not found!` });
    } else {
      const educationIndex = profile.education.findIndex(
        (education) => education._id.toString() === req.params.educationId
      );
      if (educationIndex === -1) {
        res.status(404).send({
          message: `education with ${req.params.educationId} is not found!`,
        });
      } else {
        profile.education[educationIndex] = {
          ...profile.education[educationIndex]._doc,
          ...req.body,
        };
        await profile.save();
        res.send(profile.education);
      }
    }
  }
  catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})

//------------------ delete education
Profilerouter.delete("/:id/education/:educationId",async (req,res,next)=>{
  try{
    const profile = await ProfileSchema.findById(req.params.id)
    if(!profile){
      res.status(404)
      .send({message:`profile with ${req.params.id} is not found`})
    }else{
      await ProfileSchema.findByIdAndUpdate(
        req.params.id,
        {
          $pull:{
            education:{_id:req.params.educationId},
          },
          },
          { new : true}
      );
      res.status(204)
      .send({message:`education ${req.params.educationId} deleted`})
    }
  }catch(error){
    console.log(error)
    res.status(500).send({message:error.message})
  }
})


export default Profilerouter;