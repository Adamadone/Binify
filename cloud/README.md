# Cloud app

## Communication

For communication between FE and BE we use [TRPC](https://trpc.io/).
It's a library that makes sure that FE and BE are compatible by checking typescript types.
Under the hood it's just standar GET and POST requets.

## Linter

We use [biome](https://biomejs.dev/) for linting and formatting.
To auto fix issues run `npm run lint:fix` in one of the apps.
