const uuid = require('uuid')
const AWS = require('aws-sdk')

// const dynamoDb = new AWS.DynamoDB.DocumentClient()
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

exports.create = (event, context, callback) => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.NOSQL_TABLE_NAME,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      createdAt: Date.now()
    }
  }

  // dynamoDb.put(params, (error, data) => {
  //   // Set response headers to enable CORS (Cross-Origin Resource Sharing)
  //   const headers = {
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Credentials": true
  //   }

  //   // Return status code 500 on error
  //   if (error) {
  //     const response = {
  //       statusCode: 500,
  //       headers: headers,
  //       body: JSON.stringify({ status: false })
  //     }
  //     callback(null, response)
  //     return
  //   }

  //   // Return status code 200 and the newly created item
  console.log('Anything.', JSON.stringify({ event, context, callback }))
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(params.Item)
    }
    return callback(null, response)
  // })
}
