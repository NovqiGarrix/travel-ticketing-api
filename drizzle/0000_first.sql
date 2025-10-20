CREATE TABLE "departures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"label" varchar(256) NOT NULL,
	"tag" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"label" varchar(256) NOT NULL,
	"tag" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"ticket_id" uuid NOT NULL,
	"invoice_id" varchar(256) NOT NULL,
	"payment_method_code" varchar(128) NOT NULL,
	"payment_status" varchar(12) DEFAULT 'PENDING' NOT NULL,
	"invoice_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"is_available" boolean DEFAULT true,
	"price" integer NOT NULL,
	"time" timestamp with time zone NOT NULL,
	"departure_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"estimation_time" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" serial PRIMARY KEY NOT NULL,
	"seat_identifier" varchar(2) NOT NULL,
	"schedule_id" uuid NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"schedule_id" uuid NOT NULL,
	"total_passenger" integer NOT NULL,
	"orderer" json NOT NULL,
	"seatId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seatId_seats_id_fk" FOREIGN KEY ("seatId") REFERENCES "public"."seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_id_index" ON "payments" USING btree ("invoice_id");