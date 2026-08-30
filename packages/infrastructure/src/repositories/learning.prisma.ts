import {
  StudentRepository,
  MasteryRepository,
  StudySessionRepository,
  AttemptRepository,
  QuestionRepository,
} from "@dian-study/domain";
import type {
  Student,
  MasteryState,
  StudySession,
  QuestionAttempt,
  CaseAttempt,
  Question,
  EntityId,
} from "@dian-study/domain";
import { prisma } from "../prisma/index.js";

export class StudentPrismaRepository implements StudentRepository {
  async findById(id: EntityId): Promise<Student | null> {
    const result = await prisma.student.findUnique({ where: { id } });
    if (!result) return null;
    return result as Student;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const result = await prisma.student.findUnique({ where: { email } });
    if (!result) return null;
    return result as Student;
  }

  async create(data: Omit<Student, "id" | "createdAt" | "updatedAt">): Promise<Student> {
    const result = await prisma.student.create({ data: data as any });
    return result as Student;
  }
}

export class MasteryPrismaRepository implements MasteryRepository {
  async findByStudentAndObjective(studentId: EntityId, objectiveId: EntityId): Promise<MasteryState | null> {
    const result = await prisma.masteryState.findUnique({
      where: {
        studentId_objectiveId: {
          studentId,
          objectiveId,
        },
      },
    });
    if (!result) return null;
    return result as MasteryState;
  }

  async save(data: Omit<MasteryState, "id" | "createdAt" | "updatedAt">): Promise<MasteryState> {
    // If it exists, we update, else create (upsert)
    const result = await prisma.masteryState.upsert({
      where: {
        studentId_objectiveId: {
          studentId: data.studentId,
          objectiveId: data.objectiveId,
        },
      },
      update: {
        mastery: data.mastery,
        confidence: data.confidence,
        retention: data.retention,
        totalAttempts: data.totalAttempts,
        correctAttempts: data.correctAttempts,
        consecutiveCorrect: data.consecutiveCorrect,
        lastAttemptAt: data.lastAttemptAt,
      },
      create: data,
    });
    return result as MasteryState;
  }

  async update(id: EntityId, data: Partial<MasteryState>): Promise<MasteryState> {
    const result = await prisma.masteryState.update({
      where: { id },
      data,
    });
    return result as MasteryState;
  }
}

export class StudySessionPrismaRepository implements StudySessionRepository {
  async findById(id: EntityId): Promise<StudySession | null> {
    const result = await prisma.studySession.findUnique({ where: { id } });
    if (!result) return null;
    return result as StudySession;
  }

  async create(data: Omit<StudySession, "id" | "createdAt" | "updatedAt">): Promise<StudySession> {
    const result = await prisma.studySession.create({ data: data as any });
    return result as StudySession;
  }

  async update(id: EntityId, data: Partial<StudySession>): Promise<StudySession> {
    const result = await prisma.studySession.update({
      where: { id },
      data,
    });
    return result as StudySession;
  }
}

export class AttemptPrismaRepository implements AttemptRepository {
  async saveQuestionAttempt(data: Omit<QuestionAttempt, "id" | "createdAt" | "updatedAt">): Promise<QuestionAttempt> {
    const result = await prisma.questionAttempt.create({ data: data as any });
    return result as unknown as QuestionAttempt;
  }

  async saveCaseAttempt(data: Omit<CaseAttempt, "id" | "createdAt" | "updatedAt">): Promise<CaseAttempt> {
    const result = await prisma.caseAttempt.create({ data: data as any });
    return result as CaseAttempt;
  }
}

export class QuestionPrismaRepository implements QuestionRepository {
  async findById(id: EntityId): Promise<Question | null> {
    const result = await prisma.question.findFirst({ where: { id, editorialStatus: "published" } });
    if (!result) return null;
    // Json field typing requires cast
    return result as unknown as Question;
  }

  async findByObjectiveId(objectiveId: EntityId): Promise<Question[]> {
    const results = await prisma.question.findMany({ where: { objectiveId, editorialStatus: "published" } });
    return results as unknown as Question[];
  }

  async create(data: Omit<Question, "id" | "createdAt" | "updatedAt">): Promise<Question> {
    const result = await prisma.question.create({
      data: {
        ...data,
        options: data.options ? (data.options as any) : null,
      },
    });
    return result as unknown as Question;
  }
}
