import { Router } from "express";
import { interviewSchema } from "../services/validation.js";
import { reviewInterviewAnswer } from "../services/interview.js";

export const interviewRouter = Router();

interviewRouter.post("/", async (request, response, next) => {
  try {
    const payload = interviewSchema.parse(request.body);
    const repository = request.app.locals.repository;
    const profile = payload.userId
      ? (await repository.getUser(payload.userId)) || payload.profile
      : payload.profile;
    response.json(await reviewInterviewAnswer({ profile, answer: payload.answer }));
  } catch (error) {
    next(error);
  }
});
