import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const repo = resolve(process.cwd(), "../..");
const pdfPath = join(repo, "get-document.pdf");
const sourceHash = createHash("sha256").update(readFileSync(pdfPath)).digest("hex");
const sourceFileKey = "get-document.pdf";
const functions = [
  "Adelantar labores de apoyo en la clasificación, priorización y distribución de la cartera y en la verificación de los expedientes sobre la realidad económica de la obligación, de conformidad con la normativa vigente, los procedimientos establecidos, los sistemas informáticos disponibles y las directrices impartidas.",
  "Apoyar las acciones de registro, ajuste, reclasificaciones, conciliación y trámites de las devoluciones y compensaciones, de acuerdo con la normativa vigente, los procedimientos, los lineamientos de Nivel Central, las instrucciones impartidas y el grado de responsabilidad del empleo.",
  "Asistir técnica, operativa y administrativamente la gestión a desarrollar con las Entidades Autorizadas para Recaudar, de acuerdo con la normativa, lineamientos, procedimientos y competencia.",
  "Realizar los trámites técnicos relacionados con la actualización de la cuenta corriente Contribuyente y/o obligación financiera de acuerdo con la normatividad vigente y los lineamientos establecidos.",
  "Apoyar el desarrollo del programa de corrección de inconsistencias, programas masivos del control al cumplimiento de obligaciones formales, de conformidad con los lineamientos impartidos por la dependencia competente, la normativa vigente y nivel de responsabilidad del empleo.",
  "Adelantar los procedimientos de Cobro Persuasivo e ingreso al cobro coactivo de las obligaciones administradas por la DIAN, de conformidad con la normativa vigente y responsabilidad del empleo.",
  "Prestar apoyo en la unificación de la información sobre las obligaciones a normalizar y la realidad fiscal del contribuyente, de conformidad con la normativa vigente y los procedimientos establecidos.",
  "Ayudar en el desarrollo de los programas masivos del control al cumplimiento de obligaciones formales, de acuerdo con la normativa vigente, los lineamientos de Nivel Central y nivel de responsabilidad del empleo.",
  "Ejecutar actividades técnicas en la identificación de necesidades y búsqueda de soluciones relacionadas con la creación, modificación, operación, ajuste, mantenimiento, permisos de acceso e implantación de los sistemas de información corporativos de los subprocesos de Administración de Cartera y Recaudación, así como de la información contenida en ellos, de conformidad con las políticas, planes, procedimientos, estándares institucionales vigentes, nivel y grado de responsabilidad del empleo.",
  "Las señaladas como comunes a todos los empleos de la planta de personal de la Entidad, incluidas en la resolución que adopta o modifica el manual y las demás asignadas por autoridad competente, de acuerdo con el nivel, grado de responsabilidad y el área de desempeño del empleo.",
];

const normalize = (value: string) => value.normalize("NFC").replace(/\s+/g, " ").trim();
const extracted = execFileSync("pdftotext", ["-layout", "-f", "1", "-l", "1", pdfPath, "-"], { encoding: "utf8" });
const sourceNormalized = normalize(extracted);
const functionStarts = functions.map((content) => sourceNormalized.indexOf(normalize(content).slice(0, 30)));

export async function seedOpecFunctions(prisma: PrismaClient) {
  const sourceReferenceId = `source-${sourceHash}`;
  for (const [index, content] of functions.entries()) {
    const charStart = functionStarts[index];
    const nextMarker = index < functions.length - 1 ? functionStarts[index + 1] : sourceNormalized.length;
    await prisma.opecFunction.upsert({
      where: { id: `opec-analista-i-function-${index + 1}` },
      update: { content, sourceHash, sourceFileKey, sourceReferenceId, pageStart: 1, pageEnd: 1, charStart: charStart >= 0 ? charStart : null, charEnd: nextMarker > charStart ? nextMarker : null },
      create: { id: `opec-analista-i-function-${index + 1}`, opecId: "opec-analista-i", order: index + 1, content, sourceHash, sourceFileKey, sourceReferenceId, pageStart: 1, pageEnd: 1, charStart: charStart >= 0 ? charStart : null, charEnd: nextMarker > charStart ? nextMarker : null },
    });
  }
  console.log({ seededOpecFunctions: functions.length, sourceHash });
}
