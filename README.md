# Movie App Serverless REST API with Node.js, TypeScript, and AWS DynamoDB

It is an implementation of a simple CRUD movie REST API in Node.js and TypeScript with Serverless Framework Infrastructure as a Code
to easily deploy it to AWS.

## Installation

Run:

```bash
npm install
```
## Deployment

Run:

```bash
serverless deploy
```

## Endpoints

- POST /movie - creates new movie with autogenerated UUID as id
- GET /movie/{uuid} - gets a movie by UUID
- PUT /movie/{uuid} - updates a movie by UUID
- DELETE /movie/{uuid} - deletes a movie by UUID
- GET /movies - gets a list of movies
- GET /searchMovies/{queryParams} - search movie name
