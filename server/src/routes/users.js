import { Router } from "express";
import { profileSchema } from "../services/validation.js";
import { generateCounsellingPlan } from "../services/counsellor.js";

export const userRouter = Router();

userRouter.post("/", async (request, response, next) => {
  try {
    const profile = profileSchema.parse(request.body);
    const repository = request.app.locals.repository;
    const user = await repository.createUser(profile);
    const insights = await generateCounsellingPlan(profile);
    await repository.saveInsights(user.id, insights);
    await repository.createLead({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      goals: user.goals,
      source: "onboarding"
    });
    response.status(201).json({ user, insights });
  } catch (error) {
    next(error);
  }
});
