## Description

A Travel Agency ticketing system API. Realtime seats update using SSE, locking seat system using Redis and payment using [Xendit](https://www.xendit.co/id/). All of the APIs are following the specification from [OpenAPISpec.yml](OpenAPISpec.yml).

## Project setup

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
