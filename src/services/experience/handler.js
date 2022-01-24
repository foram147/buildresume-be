import createHttpError from "http-errors";
import q2m from "query-to-mongo"
import ExperienceSchema from "../experience/schema.js";

async function getAll(req,res,next){
    try {
        const mongoQuery = q2m(req.query);
    
        const total = await ExperienceSchema.countDocuments({
          userName: req.params.userName,
        });
    
        const userExperiences = await ExperienceSchema.find({
          ...mongoQuery.criteria, userName: req.params.userName}, {
          createdAt: 0,
          updatedAt: 0,
          __v:0
        })
          .limit(mongoQuery.options.limit)
          .skip(mongoQuery.options.skip)
          .sort(mongoQuery.options.sort);
    
        if (userExperiences) {
          res.send({
            ...(mongoQuery.options.limit && {
              pageAmount: mongoQuery.links(`/user/${req.params.userName}/experiences`, total),
              links: Math.ceil(total / mongoQuery.options.limit),
            }),
            total,
            experiences: userExperiences,
          });
        } else {
          next(createHttpError(404, "User experiences not available."));
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
}

async function getById(req, res, next) {
    try {
      console.log(req.params.expId);
      const userExperience = await ExperienceSchema.findById(req.params.expId, {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });
      if (userExperience) {
        res.send(userExperience);
      } else {
        next(
          createHttpError(404, `No experience found with id: ${req.params.expId}`)
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  // ****** POST NEW EXPERIENCE *******
  async function newExperience(req, res, next) {
    try {
      const newExperience = new ExperienceSchema({
        ...req.body, 
        userName: req.params.userName
      })
      const {_id} = await newExperience.save();
  
      res.status(201).send({_id});
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async function updateExperience(req, res, next) {
    try {
      const editedExperience = await ExperienceSchema.findByIdAndUpdate(
        { _id: req.params.expId },
        { ...req.body},
        { new: true }
      );
      if(editedExperience) {
        res.send(editedExperience);
      } else {
        next(createHttpError(404, `No experience found with id: ${req.params.expId}`))
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  // ****** DELETE EXPERIENCE *********
  async function deleteExperience(req, res, next) {
    try {
      await ExperienceSchema.findOneAndDelete(req.params.expId);
      res.status(204).send();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  export default {
    getAll, getById, newExperience, updateExperience, deleteExperience
  }