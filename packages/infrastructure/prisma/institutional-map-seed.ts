import type { PrismaClient } from "@prisma/client";

const provisionIds = {
  dianCollection: "provision-et-823",
  collectingAuthorization: "0134125e-ad1b-4d17-b74d-fa9295449d3c",
  archiveDirection: "0264ca08-e6a2-4230-8a3a-d9e9c3ade6b6",
  fiscalPolice: "1156c405-64eb-449a-9a67-7a2472da3740",
  congressReport: "09734c3d-bf14-4a9e-9a37-7edfc190d282",
  jointLegalReport: "041670e2-7ce0-4d38-8437-5002b330ff93",
} as const;

export async function seedInstitutionalMap(prisma: PrismaClient) {
  const provisions = await prisma.legalProvision.findMany({
    where: { id: { in: Object.values(provisionIds) } },
    select: { id: true, validationStatus: true, editorialStatus: true, sourceReferenceId: true, pageStart: true, pageEnd: true },
  });
  const provisionById = new Map(provisions.map((provision) => [provision.id, provision]));
  const missing = Object.values(provisionIds).filter((id) => !provisionById.has(id));
  if (missing.length) throw new Error(`Institutional map sources are missing: ${missing.join(", ")}`);

  const entities = [
    { id: "institution-dian", slug: "dian", officialName: "Unidad Administrativa Especial Dirección de Impuestos y Aduanas Nacionales", aliases: ["DIAN", "Dirección de Impuestos y Aduanas Nacionales"], entityType: "special_administrative_unit", level: "national", description: "Autoridad institucional identificada en el corpus de la ruta OPEC." },
    { id: "institution-dian-director", slug: "director-general-dian", officialName: "Director General de la Dirección de Impuestos y Aduanas Nacionales", aliases: ["Director General de la DIAN", "Director de Impuestos Nacionales"], entityType: "authority", level: "national", description: "Autoridad de dirección mencionada expresamente en las disposiciones del corpus." },
    { id: "institution-polfa", slug: "direccion-policia-fiscal-aduanera", officialName: "Dirección de Policía Fiscal y Aduanera", aliases: ["Policía Fiscal y Aduanera", "POLFA"], entityType: "directorate", level: "national", description: "Dirección institucional mencionada en la normativa sobre lucha contra el contrabando." },
    { id: "institution-congress", slug: "congreso-republica", officialName: "Congreso de la República", aliases: ["Congreso"], entityType: "collegiate_body", level: "national", description: "Órgano destinatario de información institucional según una disposición del corpus." },
    { id: "institution-minhacienda", slug: "ministerio-hacienda", officialName: "Ministerio de Hacienda y Crédito Público", aliases: ["Ministerio de Hacienda", "MinHacienda"], entityType: "ministry", level: "national", description: "Ministerio mencionado en las reglas de autorización para el recaudo tributario." },
    { id: "institution-collectors", slug: "entidades-recaudadoras-autorizadas", officialName: "Entidades autorizadas para recaudar", aliases: ["Entidades recaudadoras", "Bancos autorizados"], entityType: "regulated_group", level: "national", description: "Categoría institucional usada por el Estatuto Tributario para bancos y entidades especializadas autorizadas." },
    { id: "institution-agn", slug: "archivo-general-nacion", officialName: "Archivo General de la Nación", aliases: ["AGN", "Archivo General"], entityType: "public_establishment", level: "national", description: "Entidad identificada por el corpus de gestión documental." },
    { id: "institution-andje", slug: "agencia-defensa-juridica", officialName: "Agencia Nacional de Defensa Jurídica del Estado", aliases: ["ANDJE", "Agencia de Defensa Jurídica"], entityType: "special_administrative_unit", level: "national", description: "Entidad que participa en un informe conjunto previsto en la normativa del corpus." },
    { id: "institution-national-government", slug: "gobierno-nacional", officialName: "Gobierno Nacional", aliases: ["Gobierno"], entityType: "executive_authority", level: "national", description: "Autoridad destinataria de un informe conjunto previsto en el corpus." },
  ] as const;

  for (const entity of entities) {
    await prisma.institutionalEntity.upsert({
      where: { id: entity.id },
      update: { ...entity, aliases: [...entity.aliases], status: "pending_review" },
      create: { ...entity, aliases: [...entity.aliases], status: "pending_review" },
    });
  }

  const reviewState = (sourceProvisionId: string) => {
    const provision = provisionById.get(sourceProvisionId)!;
    return provision.validationStatus === "approved" && provision.editorialStatus === "published" && provision.sourceReferenceId && provision.pageStart && provision.pageEnd
      ? { status: "confirmed", confidence: "certain" }
      : { status: "pending_review", confidence: "probable" };
  };

  const claims = [
    { id: "claim-dian-coactive-collection", entityId: "institution-dian", claimType: "competence", statement: "Es competente para aplicar el procedimiento administrativo coactivo a las deudas fiscales enumeradas por el artículo 823 del Estatuto Tributario.", sourceProvisionId: provisionIds.dianCollection, objectiveId: "objective-alcance-art-823" },
    { id: "claim-minhacienda-authorizes-collection", entityId: "institution-minhacienda", claimType: "competence", statement: "Señala los bancos y demás entidades especializadas autorizadas para recaudar y cobrar los conceptos tributarios indicados en la disposición.", sourceProvisionId: provisionIds.collectingAuthorization, objectiveId: "objective-route-10" },
    { id: "claim-agn-directs-archive-function", entityId: "institution-agn", claimType: "function", statement: "Orienta y coordina la función archivística y contribuye a salvaguardar el patrimonio documental.", sourceProvisionId: provisionIds.archiveDirection, objectiveId: "objective-route-21" },
    { id: "claim-polfa-contraband-functions", entityId: "institution-polfa", claimType: "function", statement: "Desarrolla funciones en el marco de la lucha contra el contrabando conforme al artículo 30 de la Ley 1762 de 2015 incorporado en el corpus.", sourceProvisionId: provisionIds.fiscalPolice, objectiveId: "objective-route-08" },
    { id: "claim-dian-director-congress-report", entityId: "institution-dian-director", claimType: "function", statement: "Presenta anualmente al Congreso un informe sobre resultados de gestión obtenidos con la información reportada por los obligados.", sourceProvisionId: provisionIds.congressReport, objectiveId: "objective-route-06" },
    { id: "claim-andje-joint-report", entityId: "institution-andje", claimType: "function", statement: "Participa con la Dirección General de la DIAN en el informe anual al Gobierno sobre defensa jurídica frente al contrabando y fraude aduanero.", sourceProvisionId: provisionIds.jointLegalReport, objectiveId: "objective-route-08" },
  ] as const;

  for (const claim of claims) {
    await prisma.institutionalClaim.upsert({
      where: { id: claim.id },
      update: { ...claim, ...reviewState(claim.sourceProvisionId) },
      create: { ...claim, ...reviewState(claim.sourceProvisionId) },
    });
  }

  const relations = [
    { id: "relation-dian-has-polfa", sourceEntityId: "institution-dian", targetEntityId: "institution-polfa", relationType: "dependency", label: "cuenta con", description: "La disposición indica expresamente que la DIAN contará con una Dirección de Policía Fiscal y Aduanera.", hierarchical: true, sourceProvisionId: provisionIds.fiscalPolice, objectiveId: "objective-route-08" },
    { id: "relation-director-reports-congress", sourceEntityId: "institution-dian-director", targetEntityId: "institution-congress", relationType: "reporting", label: "rinde informe a", description: "El Director General de la DIAN debe presentar anualmente el informe descrito por la disposición al Congreso.", hierarchical: false, sourceProvisionId: provisionIds.congressReport, objectiveId: "objective-route-06" },
    { id: "relation-minhacienda-authorizes-collectors", sourceEntityId: "institution-minhacienda", targetEntityId: "institution-collectors", relationType: "regulation", label: "autoriza", description: "El Ministerio señala las entidades que cumplen los requisitos para recaudar, cobrar y recibir declaraciones.", hierarchical: false, sourceProvisionId: provisionIds.collectingAuthorization, objectiveId: "objective-route-10" },
    { id: "relation-dian-director-coordinates-andje", sourceEntityId: "institution-dian-director", targetEntityId: "institution-andje", relationType: "cooperation", label: "presenta informe junto con", description: "Ambas direcciones presentan al Gobierno un informe anual en materia de defensa jurídica contra el contrabando y el fraude aduanero.", hierarchical: false, sourceProvisionId: provisionIds.jointLegalReport, objectiveId: "objective-route-08" },
    { id: "relation-andje-reports-government", sourceEntityId: "institution-andje", targetEntityId: "institution-national-government", relationType: "reporting", label: "informa a", description: "La disposición establece al Gobierno como destinatario del informe anual conjunto.", hierarchical: false, sourceProvisionId: provisionIds.jointLegalReport, objectiveId: "objective-route-08" },
  ] as const;

  for (const relation of relations) {
    await prisma.institutionalRelation.upsert({
      where: { id: relation.id },
      update: { ...relation, ...reviewState(relation.sourceProvisionId) },
      create: { ...relation, ...reviewState(relation.sourceProvisionId) },
    });
  }
}
