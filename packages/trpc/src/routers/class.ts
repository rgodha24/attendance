import { Class } from "@attendance/core/db/class";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";

const studentParser = z.object({
  // student ids are 5 digits
  studentID: z.coerce.number().min(10_000).max(99_999),
  name: z.string(),
  email: z.string().email().optional(),
});

export const classRouter = router({
  create: privateProcedure
    .input(
      z.object({
        students: z.array(studentParser),
        period: z.string(),
        semester: z.enum(["fall", "spring", "other"]),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let schoolYear = new Date().getFullYear();
      // if it's before may, it's the previous school year still
      if (new Date().getMonth() < 5) schoolYear--;

      const students = input.students.map((student) => ({
        ...student,
        email: student.email || "",
      }));

      const res = await Class.create({
        userID: ctx.userID,
        schoolYear,
        ...input,
        students,
      });

      return res.classID;
    }),

  edit: privateProcedure
    .input(
      z.object({
        students: z.array(studentParser),
        period: z.string(),
        semester: z.enum(["fall", "spring", "other"]),
        name: z.string().min(2),
        classID: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const students = input.students.map((student) => ({
        ...student,
        email: student.email || "",
      }));

      await Class.edit({ ...input, userID: ctx.userID, students });
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
        student: {
          ...input.student,
          email: input.student.email || "",
        },
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

  delete: privateProcedure
    .input(z.object({ classID: z.string() }))
    .mutation(async ({ ctx: { userID }, input: { classID } }) => {
      const res = await Class.deleteClass({ classID, userID });

      return res;
    }),
});
