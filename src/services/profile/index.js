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
import { profile } from "console";
//import UserModel from "../user/schema.js";
const Profilerouter = express.Router();

// get all profile
Profilerouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const total = await ProfileSchema.countDocuments({})

    const profile = await ProfileSchema.find({...mongoQuery}).populate({ path: "user", select: "name email job"})
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
        const profile = await ProfileSchema.findById(req.params.id).populate({ path: "user", select: "name email job"})

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
Profilerouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
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
      await Profile.findByIdAndDelete(req.params.id);
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








export default Profilerouter;