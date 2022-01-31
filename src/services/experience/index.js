import express from "express";
import Experiences from "./handler.js"

const experiencesRouter = express.Router()

experiencesRouter.route("/:id/experience")
.get(Experiences.getAll)
.post(Experiences.newExperience)

experiencesRouter.route("/:id/experiences/:expId")
.get(Experiences.getById)
.put(Experiences.updateExperience)
.delete(Experiences.deleteExperience);

export default experiencesRouter;