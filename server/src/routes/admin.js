import { Router } from "express";

export const adminRouter = Router();

adminRouter.get("/", async (request, response, next) => {
  try {
    const repository = request.app.locals.repository;
    const [users, leads, insightRows] = await Promise.all([
      repository.listUsers(),
      repository.listLeads(),
      repository.listInsights()
    ]);
    const scores = insightRows.map((row) => row.insights?.fitScore).filter((score) => Number.isFinite(score));
    const averageFitScore = scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;

    response.json({
      userCount: users.length,
      leadCount: leads.length,
      averageFitScore,
      recentUsers: users.slice(-8).reverse()
    });
  } catch (error) {
    next(error);
  }
});
