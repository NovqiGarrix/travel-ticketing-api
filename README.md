## Description

A Travel Agency ticketing system API. Realtime seats update using SSE, locking seat system using Redis and payment using [Xendit](https://www.xendit.co/id/). All of the APIs are following the specification from [OpenAPISpec.yml](OpenAPISpec.yml).

## Project setup

### Xendit
We use Xendit as our payment gateway, that so, you need to create an account, a test one. You do not need to verify your documents, but you have to choose the type of business you're in in the registration process. Just choose whatever business you might involve in the future.
After that create your API key here: [https://dashboard.xendit.co/settings/developers#api-keys](https://dashboard.xendit.co/settings/developers#api-keys). Choose write permission for the first permission. Setup 2FA, and copy your secret key into the `.env` file [See Environment Variables step](https://github.com/NovqiGarrix/travel-ticketing-api?tab=readme-ov-file#environment-variables). You also need the [Webhook Token Verification](https://dashboard.xendit.co/settings/developers#webhooks). Copy it and put in `.env` file.

### Install Dependencies
```bash
$ pnpm install
```

### Setup database
Create a new database. Here we're using PostgreSQL. Setup env variables (check `Environment Variables` step). After that run:
```bash
$ pnpm dlx drizzle-kit migrate
```
After that we need to populate the database:
```bash
$ bun run seed/index.ts
```
Unfortunately, you need to install Bun in order to run this command.
Bun is required because it can compiles TypeScript out of the box. Node.js, since v22 can also run TypeScript code, but by striping the types, in easy words, it did not compile the code. So, we have to deal with a bunch of build errors. See it yourself:
```bash
$ node --experimental-strip-types seed/index.ts
```

### Environment Variables
Create `.env` file and fill out all the neccesary variables from `.env.example`.

> ! Not sponsored, but I love their product
>
> In this project, we use Postgres as our primary database to store our travels, schedules, orders, etc.. and Redis to temporary lock a seat while waiting for payment. For testing and development, you can use Docker (I provided the docker compose file, you can run the services using `docker compose start -d`). But for production, you can use Neon or Supabase for Postgres, and for Redis, you can use Upstash. It's free btw, good for hobby/personal projects.
>
> Again, I'm not sponsored, but I love their product

### Redis Setup
Every locked seats in Redis has TTL expiration (which is 10 minutes). Since we're using SSE for realtime seats update, we need to inform the client the seats are unlocked (after the TTL expired). To do that, we need to set up our Redis to send events when a key is expired. Log in to your Redis using CLI and run this command:
```cli
CONFIG SET notify-keyspace-events Ex
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests
You need to create a new database for testing. After that run these migrations command:
```bash
$ NODE_ENV=testing npx drizzle-kit migrate
$ NODE_ENV=testing bun run seed/index.ts
```

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
