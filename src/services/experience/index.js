import express from "express";
import Experiences from "./handler.js"

const experiencesRouter = express.Router()

experiencesRouter.route("/")
.get(Experiences.getAll)
experiencesRouter.route("/:id")
.get(Experiences.profExp)

experiencesRouter.route("/:id")
.get(Experiences.getById)
.post(Experiences.newExperience)
.put(Experiences.updateExperience)
.delete(Experiences.deleteExperience);

export default experiencesRouter;