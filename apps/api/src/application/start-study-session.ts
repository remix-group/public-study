import { prisma } from "@dian-study/infrastructure";

export interface StartStudySessionInput {
  studentId: string;
  competencyId: string;
  mode?: "LEARN" | "PRACTICE" | "ASSESS" | "REVIEW" | "CASE";
  focusObjectiveId?: string;
}

export class StudySessionNotFoundError extends Error {}

export async function startStudySession(input: StartStudySessionInput) {
  return prisma.$transaction(async (tx) => {
    const [student, competency] = await Promise.all([
      tx.student.findUnique({ where: { id: input.studentId } }),
      tx.competency.findUnique({
        where: { id: input.competencyId },
        include: {
          blocks: {
            where: { status: "active" },
            orderBy: { order: "asc" },
            include: {
              topics: {
                where: { status: "active" },
                orderBy: { order: "asc" },
                include: {
                  learningObjectives: { where: { status: "active" }, orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      }),
    ]);
    if (!student) throw new StudySessionNotFoundError("Student not found");
    if (!competency || competency.status !== "active") throw new StudySessionNotFoundError("Active competency not found");

    const session = await tx.studySession.create({
      data: { studentId: input.studentId, competencyId: input.competencyId, mode: input.mode ?? "PRACTICE", focusObjectiveId: input.focusObjectiveId },
    });
    return { session, competency };
  });
}
