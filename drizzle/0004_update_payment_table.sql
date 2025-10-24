ALTER TABLE "payments" RENAME COLUMN "invoice_id" TO "payment_session_id";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "payment_method_code" TO "amount";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "invoice_url" TO "error";--> statement-breakpoint
DROP INDEX "invoice_id_index";--> statement-breakpoint
CREATE INDEX "payment_session_id_index" ON "payments" USING btree ("payment_session_id");