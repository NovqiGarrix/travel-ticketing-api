import { DbService, schema } from '../src/db/db.service';
import { ConfigService } from '@nestjs/config';
import { NewSchedule } from 'src/db/schema';
import { sql } from 'drizzle-orm';

const today = () => new Date();

function getTime(date: Date, hour: number, min = 0) {
  date.setHours(hour, min);
  return date;
}

function getRandom(elementLength: number) {
  return Math.floor(Math.random() * elementLength);
}

async function main() {
  const configService = new ConfigService();
  const db = new DbService(configService).db;

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE schedules CASCADE`);
    await tx.execute(sql`TRUNCATE departures CASCADE`);
    await tx.execute(sql`TRUNCATE destinations CASCADE`);

    // Seed departures
    const departures = await tx
      .insert(schema.departure)
      .values([
        {
          label: 'INDOMARET CILEUNYI',
          tag: 'BANDUNG',
        },
        {
          label: 'OUTLET BUAH BATU',
          tag: 'BANDUNG',
        },
        {
          label: 'OUTLET DIPATIKUKUR',
          tag: 'BANDUNG',
        },
        {
          label: 'OUTLET WARUNG JAMBU',
          tag: 'BOGOR',
        },
        {
          label: 'HALTE ALUMNI IPB',
          tag: 'BOGOR',
        },
      ])
      .returning();

    const destinations = await tx
      .insert(schema.destination)
      .values([
        {
          label: 'ALFAMART BANJAR ATAS',
          tag: 'BANJAR',
        },
        {
          label: 'REST AREA KM 6b JATIBENING',
          tag: 'BEKASI',
        },
        {
          label: 'OUTLET WARUNG JAMBU',
          tag: 'BOGOR',
        },
        {
          label: 'GERBANG TOL BARANGSIANG',
          tag: 'BOGOR',
        },
        {
          label: 'TAMAN CORAT CORET BANTARJATI',
          tag: 'BOGOR',
        },
        {
          label: 'TERMINAL KARANGPUCUNG',
          tag: 'CILACAP',
        },
        {
          label: 'ALFAMART KRAGILAN',
          tag: 'BOYOLALI',
        },
      ])
      .returning();

    const times = [
      getTime(today(), 5),
      getTime(today(), 7),
      getTime(today(), 9),
      getTime(today(), 11),
      getTime(today(), 13),
      getTime(today(), 14, 30),
      getTime(today(), 16),
      getTime(today(), 18),
      getTime(today(), 20),
    ];

    // In hours
    const estimationTimes = [1, 2, 3, 4, 5];

    const prices = [75000, 88000, 120000, 240000, 140000];

    // Since we're getting random destination
    // we need to make sure no duplicate destination selected
    const schedulesMap = new Map<string, NewSchedule>();

    for (const departure of departures) {
      let destination = destinations.at(getRandom(destinations.length))!;
      let mapKey = `${departure.id}-${destination.id}`;

      while (schedulesMap.has(mapKey)) {
        destination = destinations.at(getRandom(destinations.length))!;
        mapKey = `${departure.id}-${destination.id}`;
      }

      const newSchedule: NewSchedule = {
        departureId: departure.id,
        destinationId: destination.id,
        estimationTime:
          estimationTimes.at(getRandom(estimationTimes.length))! * 3600,
        // Note that if the destination city is same but in different locations
        // the price should be the same as well.
        // To make things simple, we do not implement that here,
        // since this is just to populate our database
        price: prices.at(getRandom(prices.length))!,
        time: times.at(getRandom(times.length))!.toUTCString(),
      };

      schedulesMap.set(mapKey, newSchedule);
    }

    const schedules = Array.from(schedulesMap, ([, v]) => v);
    await tx.insert(schema.schedule).values(schedules);
  });
}

void main();
