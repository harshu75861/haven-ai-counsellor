import { z } from "zod";

const stringList = z.union([z.array(z.string()), z.string()]).transform((value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
});

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  education: z.string().min(2),
  location: z.string().default(""),
  interests: stringList.default([]),
  skills: stringList.default([]),
  goals: z.string().min(4),
  targetCountry: z.string().default("Canada"),
  budget: z.string().default(""),
  experience: z.string().default("")
});

export const chatSchema = z.object({
  userId: z.string().optional(),
  profile: profileSchema.partial().default({}),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string()
    })
  )
});

export const resumeSchema = z.object({
  userId: z.string().optional(),
  profile: profileSchema.partial().default({}),
  role: z.string().min(2)
});

export const interviewSchema = z.object({
  userId: z.string().optional(),
  profile: profileSchema.partial().default({}),
  answer: z.string().min(10)
});
