# Cloud app

## Development

For BE development you will need a Postgres database.
The easiest way to get started is to install Docker and then run `docker compose up`.

To run `api` and `web` apps:
1. Run `npm install` - it's enough to run it only once, when setting up this project
2. Run `npm dev` in `api` and `web` directories
3. Go to `http://localhost:3000`


## Communication

For communication between FE and BE we use [TRPC](https://trpc.io/).
It's a library that makes sure that FE and BE are compatible by checking typescript types.
Under the hood it's just standart GET and POST requests.

## Linter

We use [biome](https://biomejs.dev/) for linting and formatting.
To auto fix issues run `npm run lint:fix` in one of the apps.

## Dynamic configuration

All dynamic configuration (like api url, oauth keys) are stored in environment variables so that the app can be easily deployed.
Values for local development are stored in `.env` files.

## BE

### DB

To create DB migration run `npx prisma migrate dev --name <name>` in `api` directory.
And to run the migrations run `npx prisma migrate dev`.

You can view the DB using `npx prisma studio` in `api` directory.


### Dev utils

Dev utils are scripts to help you with simulating data. They are located at `cloud/src/devUtils/`.

To run them, build the `api` project `npm run  dev` or `npm run build` and run `node dist/devUtils/<scriptName>.js`


## FE

### components

FE components are bootstraped from [shadcn](https://ui.shadcn.com/) and for styling we use [Tailwind CSS](https://tailwindcss.com/).
To add a component run `npx shadcn add` in **`web`** directory.
