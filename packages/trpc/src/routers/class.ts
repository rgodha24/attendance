import { Class } from "@attendance/core/db/class";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";

const studentParser = z.object({
  studentID: z.coerce.number(),
  name: z.string(),
  email: z.string().email().default(""),
});

export const classRouter = router({
  create: privateProcedure
    .input(studentParser.array())
    .mutation(async ({ ctx, input }) => {
      const res = await Class.create({
        userID: ctx.userID,
        students: input,
      });

      return res.classID;
    }),

  addStudent: privateProcedure
    .input(
      z.object({
        classID: z.string(),
        student: studentParser,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const res = await Class.addStudent({
        classID: input.classID,
        userID: ctx.userID,
        student: input.student,
      });

      return res;
    }),

  removeStudent: privateProcedure
    .input(z.object({ studentID: z.number(), classID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await Class.removeStudent({
        classID: input.classID,
        userID: ctx.userID,
        studentID: input.studentID,
      });

      return res.students?.length || 0;
    }),

  getAll: privateProcedure.query(async ({ ctx }) => Class.byUserID(ctx.userID)),
});
