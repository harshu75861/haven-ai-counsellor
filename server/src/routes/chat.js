import { Router } from "express";
import { chatSchema } from "../services/validation.js";
import { generateChatReply, generateCounsellingPlan } from "../services/counsellor.js";

export const chatRouter = Router();

chatRouter.post("/", async (request, response, next) => {
  try {
    const payload = chatSchema.parse(request.body);
    const repository = request.app.locals.repository;
    const profile = payload.userId
      ? (await repository.getUser(payload.userId)) || payload.profile
      : payload.profile;
    const message = await generateChatReply({ profile, messages: payload.messages });
    const insights = await generateCounsellingPlan(profile, payload.messages.at(-1)?.content);

    if (payload.userId) {
      await repository.addMessage(payload.userId, payload.messages.at(-1));
      await repository.addMessage(payload.userId, message);
      await repository.saveInsights(payload.userId, insights);
    }

    response.json({ message, insights });
  } catch (error) {
    next(error);
  }
});
