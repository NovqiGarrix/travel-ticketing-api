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
	"payment_session_id" varchar(256) NOT NULL,
	"payment_status" varchar(12) DEFAULT 'PENDING' NOT NULL,
	"amount" integer NOT NULL,
	"error" text
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
	"schedule_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"schedule_id" uuid NOT NULL,
	"total_passenger" integer NOT NULL,
	"orderer" json NOT NULL,
	"seat_identifier" varchar(2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_session_id_index" ON "payments" USING btree ("payment_session_id");