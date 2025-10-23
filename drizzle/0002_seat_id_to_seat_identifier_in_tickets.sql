ALTER TABLE "tickets" RENAME COLUMN "seatId" TO "seat_identifier";--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_seatId_seats_id_fk";
