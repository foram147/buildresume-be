import createHttpError from "http-errors";
import q2m from "query-to-mongo"
import EducationSchema from "../education/schema.js";

async function getAll(req,res,next){
    try {
        const mongoQuery = q2m(req.query);
    
        const total = await EducationSchema.countDocuments({
          _id: req.params.id,
        });
    
        const userEducation = await EducationSchema.find({
          ...mongoQuery.criteria }, {
          createdAt: 0,
          updatedAt: 0,
          __v:0
        })
          .limit(mongoQuery.options.limit)
          .skip(mongoQuery.options.skip)
          .sort(mongoQuery.options.sort);
    
        if (userEducation) {
          res.send({
            ...(mongoQuery.options.limit && {
              pageAmount: mongoQuery.links(`/user/${req.params.id}/experiences`, total),
              links: Math.ceil(total / mongoQuery.options.limit),
            }),
            total,
            education: userEducation,
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
      const userEducation = await EducationSchema.findById(req.params.eduId, {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });
      if (userEducation) {
        res.send(userEducation);
      } else {
        next(
          createHttpError(404, `No experience found with id: ${req.params.eduId}`)
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  // ****** POST NEW Education *******
  async function newEducation(req, res, next) {
    try {
      const newEducation = new EducationSchema({
        ...req.body, 
        userName: req.params.userName
      })
      const {_id} = await newEducation.save();
  
      res.status(201).send({_id});
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async function updateEducation(req, res, next) {
    try {
      const editedEducation = await EducationSchema.findByIdAndUpdate(
        { _id: req.params.eduId },
        { ...req.body},
        { new: true }
      );
      if(editedEducation) {
        res.send(editedEducation);
      } else {
        next(createHttpError(404, `No experience found with id: ${req.params.eduId}`))
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  // ****** DELETE EXPERIENCE *********
  async function deleteEducation(req, res, next) {
    try {
      await EducationSchema.findOneAndDelete(req.params.eduId);
      res.status(204).send();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  export default {
    getAll, getById, newEducation, updateEducation, deleteEducation
  }