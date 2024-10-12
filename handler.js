'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello Rohit !',
        statusCode: 200,
        input: event,
      },
      null,
      2
    ),
  };


};
