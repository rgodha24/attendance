import { ClassEntity } from "./schema";
import { EntityRecord } from "electrodb";
import { ulid } from "ulid";
import { TRPCError } from "@trpc/server";

type ClassInner = EntityRecord<typeof ClassEntity>;
type Student = ClassInner["students"][number];

export async function byUserID(userID: number) {
  const classes = await ClassEntity.query.classes({ userID }).go();
  return classes.data;
}

export async function byID({
  classID,
  userID,
}: {
  classID: string;
  userID: number;
}) {
  const class_ = await ClassEntity.query.classes({ classID, userID }).go();
  return class_.data[0];
}

export async function create(args: Omit<ClassInner, "classID">) {
  const class_ = await ClassEntity.create({
    classID: ulid(),
    ...args,
  }).go();

  return class_.data;
}

export async function edit(
  args: Pick<
    ClassInner,
    "name" | "students" | "period" | "classID" | "userID" | "semester"
  >
) {
  const class_ = await ClassEntity.patch({
    classID: args.classID,
    userID: args.userID,
  })
    .set({
      name: args.name,
      students: args.students,
      period: args.period,
      semester: args.semester,
    })
    .go();

  return class_.data;
}

export async function addStudent({
  classID,
  userID,
  student,
}: {
  classID: string;
  userID: number;
  student: Student;
}) {
  // this should (?) make sure that the user owns the class because it's looking to patch
  // a class that has both the userID and classID
  const class_ = await ClassEntity.patch({ classID, userID })
    .append({ students: [student] })
    .go();

  return class_.data;
}

export async function removeStudent({
  classID,
  userID,
  studentID,
}: {
  classID: string;
  userID: number;
  studentID: number;
}) {
  const oldStudents = await byID({ classID, userID });
  // TODO: could also be unauthorized
  if (!oldStudents) throw new TRPCError({ code: "NOT_FOUND" });

  // it's a set, not a list so we need to do it this way (TODO: make it a set?)
  const class_ = await ClassEntity.patch({ classID, userID })
    .set({
      students: oldStudents.students.filter((s) => s.studentID !== studentID),
    })
    .go();

  return class_.data;
}

export async function deleteClass({
  classID,
  userID,
}: {
  classID: string;
  userID: number;
}) {
  // should also check that the user owns the class bc pk(userID)
  const class_ = await ClassEntity.delete({ classID, userID }).go();

  return class_.data;
}

export * as Class from "./class";
