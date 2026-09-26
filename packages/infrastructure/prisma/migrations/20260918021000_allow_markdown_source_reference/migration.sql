-- Markdown transcriptions are provisional source material, not PDFs.
ALTER TABLE "source_references" DROP CONSTRAINT "source_references_mimeType_check";
ALTER TABLE "source_references"
  ADD CONSTRAINT "source_references_mimeType_check"
  CHECK ("mimeType" IN ('application/pdf', 'text/markdown'));
