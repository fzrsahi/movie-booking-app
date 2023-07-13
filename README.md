<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This is a repository for the task given by Compfest as a requirement to join the Software Engineer Academy.

This REST API Application use Nest Js, Posgtree SQL, and deploy into [Railway](https://movie-booking-app-production.up.railway.app/api/v1/movies?page=1&limit=10). Click to see the REST API

## Installation

```bash
$ npm install
```

## Configure The database

This App use docker compose to configure the Postgree SQL database.
configure the docker compose :

rename the docker-compose copy.yml to docker-compose.yml

```bash

version: '3.8'
services:
  dev-db:
    image: postgres:alpine3.18
    ports:
      - 5434:5432
    environment:
      POSTGRES_USER: yourhostname
      POSTGRES_PASSWORD: yourpassword
      POSTGRES_DB: yourdbname

      # change the value to your configuration

```

## Configure the .env file

rename the .env copy to .env

```bash
 example .env file :
 - DATABASE_URL="postgresql://yourhostname:yourpassword@localhost:5434/yourdbname?schema=public"
 - JWT_SECRET="yoursecretjwttoken"
 - SECRET_TOKEN="yoursecretjwttoken"
 - PORT =3000 # default

 #NOTE : if you use the docker compose , please make sure the value you use in the .env DATABASE_URL same with value you use in docker-compose.yml
```

## Build the database

```bash
# generate prisma
$ npx prisma generate

# push the schema
$ npx prisma db push

# seed the database
$ npx prisma db seed
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Rest Api Documentation

you can see the endpoint documentation in here

[LINK DOCUMENTATION](https://documenter.getpostman.com/view/21962409/2s946e9tW4#sea-cinema-rest-api)

## Stay in touch

- Author - [Fazrul Anugrah Sahi](https://instagram.com/fzrsahi)

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
