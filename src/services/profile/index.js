import express from "express";
import basicMiddleware from "../../utils/auth/basic.js";
import { JwtMiddleware } from "../../utils/auth/jwt.js";
import onlyOwner from "../../utils/auth/onlyOwner.js";
import Profile from "./schema.js";
import { uploadProfilePicture } from "../../utils/upload/index.js";
import createHttpError from "http-errors";
import { generateCVPDF } from "../../utils/pdf/index.js";
import { pipeline } from "stream";
const Profilerouter = express.Router();

// get profile
Profilerouter.get("/:id/profile", async (req, res, next) => {
  try {
    const profile = await Profile.find({}).populate({
      path: "user",
      select: "email name job",
    });
    res.send(profile);
  } catch (error) {
    console.log({ error });
    res.send(500).send({ message: error.message });
  }
});

Profilerouter.post(
  "/:id/picture",
  uploadProfilePicture,
  async (req, res, next) => {
    //console.log(req.whatever)
    try {
      console.log(req.file)
      const uploadPicture = await Profile.findByIdAndUpdate(
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

Profilerouter.get("/:id/profile/PDF", async (req, res, next) =>{
  try{
        const profile = await Profile.findById(req.params.id).populate({ path: "user", select: "name email job"})

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
  "/:id/profile",
  JwtMiddleware,
  (req, res, next) => {
    req.body.user = req.user._id.toString()
    next()
  },
  //checkBlogPostSchema,
  //checkValidationResult,
  async (req, res, next) => {
    try {
      const profile = await new Profile(req.body).save();
      res.status(201).send(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
);

Profilerouter.get("/:id", async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id).populate({path:"user"})
    if (!profile) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} is not found!` });
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
        .send({ message: `blog with ${req.params.id} is not found!` });
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
    const updated = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(updated);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});








export default Profilerouter;