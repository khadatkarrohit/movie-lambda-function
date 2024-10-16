import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";
import * as yup from "yup";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "MovieMaster";
const headers = {
  "content-type": "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Accepts": '*/*',
};

const schema = yup.object().shape({  
  movie_name: yup.string().required(),
  details: yup.string().required(),
  genre: yup.string().required(),
  actor: yup.string().required(),
  release_date: yup.string().required()
});

export const createMovie = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const movie = { ...reqBody, id: v4(), };

    await docClient
      .put({
        TableName: tableName,
        Item: movie,
      })
      .promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(movie),
    };
  } catch (e) {
    return handleError(e);
  }
};

class HttpError extends Error {
  constructor(public statusCode: number, body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

const fetchMovieById = async (id: string) => {
  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        id: id,
      },
    })
    .promise();

  if (!output.Item) {
    throw new HttpError(404, { error: "not found" });
  }

  return output.Item;
};

const handleError = (e: unknown) => {
  if (e instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        errors: e.errors,
      }),
    };
  }

  if (e instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `invalid request body format : "${e.message}"` }),
    };
  }

  if (e instanceof HttpError) {
    return {
      statusCode: e.statusCode,
      headers,
      body: e.message,
    };
  }

  throw e;
};

export const getMovie = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const product = await fetchMovieById(event.pathParameters?.id as string);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const updateMovie = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;

    await fetchMovieById(id);

    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const product = {
      ...reqBody,
      id: id,
    };

    await docClient
      .put({
        TableName: tableName,
        Item: product,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const deleteMovie = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;

    await fetchMovieById(id);

    await docClient
      .delete({
        TableName: tableName,
        Key: {
          id: id,
        },
      })
      .promise();

    return {
      statusCode: 204,
      body: "",
    };
  } catch (e) {
    return handleError(e);
  }
};

export const listMovie = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const output = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  };
};

export const searchDetails = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const query_params = event.pathParameters?.queryParams as string;
  let movieName = query_params.split('=')[1];
  
  var params = {    
    ExpressionAttributeValues: {
      ":movie_name": movieName
    },
    ProjectionExpression: "id, movie_name",    
    TableName: tableName,
    FilterExpression: 'movie_name = :movie_name',    
  };
  
  const search_result = await docClient.scan(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);            
    }
  }).promise(); 

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(search_result),
  };
};
