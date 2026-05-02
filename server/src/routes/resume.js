import { Router } from "express";
import { resumeSchema } from "../services/validation.js";
import { buildResume } from "../services/resume.js";

export const resumeRouter = Router();

resumeRouter.post("/", async (request, response, next) => {
  try {
    const payload = resumeSchema.parse(request.body);
    const repository = request.app.locals.repository;
    const profile = payload.userId
      ? (await repository.getUser(payload.userId)) || payload.profile
      : payload.profile;
    const resume = await buildResume({ profile, role: payload.role });
    response.json(resume);
  } catch (error) {
    next(error);
  }
});
