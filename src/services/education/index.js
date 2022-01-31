import express from "express";
import Education from "./handler.js"

const educationRouter = express.Router()

educationRouter.route("/:id/education")
.get(Education.getAll)
.post(Education.newEducation)

educationRouter.route("/:id/education/:eduId")
.get(Education.getById)
.put(Education.updateEducation)
.delete(Education.deleteEducation);

export default educationRouter;