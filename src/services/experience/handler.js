import createHttpError from "http-errors";
import q2m from "query-to-mongo"
import ProfileSchema from "../profile/schema.js"
import ExperienceSchema from "./schema.js"

async function getAll(req,res,next){
    try {
        const mongoQuery = q2m(req.query);
    
        const total = await ExperienceSchema.countDocuments({});
    
        
        const experiences = await ExperienceSchema.find({...mongoQuery})
        .limit(mongoQuery.options.limit)
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort)
        
        
        res.send({
          ...(mongoQuery.options.limit && {
            pageAmount: mongoQuery.links(`/experience`, total),
        links: Math.ceil(total/ mongoQuery.options.limit),
      }),
      total,
      experiences
    })
      } catch (error) {
        console.log(error);
        next(error);
      }
}

async function getById(req, res, next) {
    try {
      console.log(req.params.id);
      const userExperience = await ExperienceSchema.findById(req.params.id)
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
  
//************ GET BY PROFILE ID */
async function profExp(req, res, next) {
  try {
    const id = req.params.id
    console.log(req.params.id);
    const userExperience = await ExperienceSchema.findOne({profileId:id})
       if (userExperience) {
      res.send(userExperience);
    } else {
      next(
        createHttpError(404, `No experience found with id: ${req.params.id}`)
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
      console.log(req.body)
          const id = req.params.id
          
          const experience =  new ExperienceSchema(req.body)
          experience.profileId = id
          await experience.save()
  
          console.log(experience)
          if(experience){
              const updatedProfile = await ProfileSchema.findOneAndUpdate(
                  {_id: id},
                  { $push: { experience: experience._id}},
                  { new: true }
              )
              res.status(201).send(updatedProfile)
          } else {
              res.status(404).send("Experience with id ${id} not found") 
          }
      } catch (error) {
         console.error(error) 
      }
  
  }

  async function updateExperience(req, res, next) {
    try {
      const editedExperience = await ExperienceSchema.findByIdAndUpdate(
        { _id: req.params.id },
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
      await ExperienceSchema.findByIdAndRemove(req.params.id);
      res.status(204).send({message:`deleted`});
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  export default {
    getAll, getById, profExp ,newExperience, updateExperience, deleteExperience
  }