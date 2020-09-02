const uuid = require('uuid')
const AWS = require('aws-sdk')

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

function HTTPError(error) {
  console.log('Error: ', JSON.stringify(error))
  return {
    statusCode: error.statusCode || 500,
    headers: headers,
    body: JSON.stringify({ status: false })
  }
}

export function create(event, context, callback) {
  // Creates document for specified key with content.
  const data = JSON.parse(event.body)
  const params = {
    TableName: process.env.NOSQL_TABLE_NAME,
    Item: {
      userId: event.requestContext.authorizer.claims.sub,
      noteId: uuid.v1(),
      content: data.content,
      createdAt: Date.now()
    }
  }

  dynamoDb.put(params, (error, data) => {
    // Error
    if (error) {
      const response = HTTPError(error)
      callback(null, response)
      return
    }
    // Success
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(params.Item)
    }
    return callback(null, response)
  })
}

export function get(event, context, callback) {
  // Gets document content for specified key.
  const params = {
    TableName: process.env.NOSQL_TABLE_NAME,
    Key: {
      userId: event.requestContext.authorizer.claims.sub,
      noteId: event.pathParameters.id,
    }
  }

  dynamoDb.get(params, (error, data) => {
    // Error
    if (error) {
      const response = HTTPError(error)
      callback(null, response)
      return
    }
    // Success
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data.Item)
    }
    return callback(null, response)
  })
}

export function getAll(event, context, callback) {
  // Gets document content for specified key.
  const params = {
    TableName: process.env.NOSQL_TABLE_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': event.requestContext.authorizer.claims.sub
    }
  }

  dynamoDb.query(params, (error, data) => {
    // Error
    if (error) {
      const response = HTTPError(error)
      callback(null, response)
      return
    }
    // Success
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data.Items)
    }
    return callback(null, response)
  })
}

export function update(event, context, callback) {
  // Gets document content for specified key.
  const data = JSON.parse(event.body)
  const params = {
    TableName: process.env.NOSQL_TABLE_NAME,
    Key: {
      userId: event.requestContext.authorizer.claims.sub,
      noteId: event.pathParameters.id,
    },
    UpdateExpression: "SET content = :content",
    ExpressionAttributeValues: {
      ":content": data.content || null
    },
    ReturnValues: "ALL_NEW"
  }

  dynamoDb.update(params, (error, data) => {
    // Error
    if (error) {
      const response = HTTPError(error)
      callback(null, response)
      return
    }
    // Success
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ status: true })
    }
    return callback(null, response)
  })
}
