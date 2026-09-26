import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  await prisma.$transaction([
    prisma.topic.update({ where: { id: "topic-route-15" }, data: { name: "Procesos Concursales" } }),
    prisma.topic.update({ where: { id: "topic-route-16" }, data: { name: "Régimen de Insolvencia (procesos concursales)" } }),
  ]);
  console.log({ synchronizedTopics: ["topic-route-15", "topic-route-16"] });
} finally {
  await prisma.$disconnect();
}
