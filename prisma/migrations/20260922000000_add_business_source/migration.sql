-- Provenance tracking for imported businesses (osm | overture | gmaps | user)
ALTER TABLE "businesses" ADD COLUMN "source" TEXT;
ALTER TABLE "businesses" ADD COLUMN "source_id" TEXT;
CREATE INDEX "idx_businesses_source" ON "businesses"("source", "source_id");
