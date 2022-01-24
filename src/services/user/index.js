import express from "express";
import UserSchema from "./schema.js";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { generateCVPDF } from "../../utils/pdf/index.js";
import { pipeline } from "stream";
import { uploadProfilePicture } from "../../utils/upload/index.js";
//import { checkBlogPostSchema, checkValidationResult } from "./validation.js";

const userRouter = express.Router();

// get all template
userRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const {total, user} = await UserSchema.findCVByUserName(mongoQuery)
    
    //const template = await TemplateSchema.find();
    res.send({
      links: mongoQuery.links("/templates", total),
      pageTotal: Math.ceil(total / mongoQuery.options.limit),
      total,
      user,
    });
  } catch (error) {
   next(error) //res.sendStatus(500).send({ message: error.message });
  }
});

userRouter.post(
    "/",
    //checkBlogPostSchema,
    //checkValidationResult,
    async (req, res, next) => {
      try {
        const newUser =  new UserSchema(req.body);
        const {_id} = await newUser.save()
        res.status(201).send({_id});
      } catch (error) {
        console.log(error);
        next(error)//res.send(500).send({ message: error.message });
      }
    }
  );


  userRouter.post(
    "/:id/picture",
    uploadProfilePicture,
    async (req, res, next) => {
      console.log(req.whatever)
      try {
        console.log(req.file)
        const uploadPicture = await UserSchema.findByIdAndUpdate(
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


  userRouter.get("/:id", async (req, res, next) => {
    try {
      const template = await UserSchema.findById(req.params.id);
      if (!template) {
        res
          .status(404)
          .send({ message: `template with ${req.params.id} is not found!` });
      } else {
        res.send(template);
      }
    } catch (error) {
      next(error)//res.send(500).send({ message: error.message });
    }
  });

  userRouter.delete("/:id", async (req, res, next) => {
    try {
      const template = await UserSchema.findById(req.params.id);
      if (!template) {
        res
          .status(404)
          .send({ message: `Template with ${req.params.id} is not found!` });
      } else {
        await UserSchema.findByIdAndDelete(req.params.id);
        res.status(204).send();
      }
    } catch (error) {
      next(error)// res.send(500).send({ message: error.message });
    }
  });

  userRouter.put("/:id", async (req, res, next) => {
    try {
      const updated = await UserSchema.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.send(updated);
    } catch (error) {
      next(error)//res.send(500).send({ message: error.message });
    }
  });
  
  userRouter.get("/:id/PDF", async (req, res, next) =>{
    try{
          const user = await UserSchema.findById(req.params.id)

          if(!user){
            res.status(404)
            .send({message: `user id ${req.params.id} not found`})
          } else{
            const source = await generateCVPDF(user)
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


  export default userRouter;
  