let AWS = require("aws-sdk")
let polly = new AWS.Polly()
let s3 = new AWS.S3()
const { v1: uuidv1 } = require('uuid')
let fs = require('fs')


module.exports.speak = (event, context, callback) => {
  let data = JSON.parse(event.body)
  const pollyParams = {
    OutputFormat: "mp3",
    Text: data.text,
    VoiceId: data.voice
  }

  polly.synthesizeSpeech(pollyParams)
    .on("success", function (response) {
      let data = response.data
      let audioStream = data.AudioStream
      let key = uuidv1()
      let s3BucketName = 'speech-nlp-backend'
      let params = {
        Bucket: s3BucketName,
        Key: key + '.mp3',
        Body: audioStream
      }
      s3.putObject(params)
        .on("success", function (response) {
          console.log("S3 Put Success!")
        })
        .on("complete", function () {
          console.log("S3 Put Complete!")
          let s3params = {
            Bucket: s3BucketName,
            Key: key + '.mp3',
          }
          let url = s3.getSignedUrl("getObject", s3params)
          let result = {
            bucket: s3BucketName,
            key: key + '.mp3',
            url: url
          }
          callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result)
          })
        })
        .on("error", function (response) {
          console.log(response)
        })
        .send()
    })
    .on("error", function (err) {
      callback(null, {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin" : "*"
        },
        body: JSON.stringify(err)
      })
    })
    .send()
}

module.exports.processTemp = (event, context, callback) => {
  try {
    let data = event.body.toString() // Would actually take uploaded PDF and move it to S3. Let's assume input is already processed.
    let arr = data.split('\n')
    let newArr = []
    var result = ''
    arr = arr.map(line => {
      let len = line.length
      if (line.replace(/([a-z]|\ )/g, '').length > 0.5 * len) return ''
      if (line.replace(/[0-9]/g, '').length < 0.9 * len) return ''
      if (line.replace(/[A-Za-z0-9\ ]/g, '').length > 0.1 * len) return ''
      if (line.match(/^(\[\d+\])/)) return ''
      line.replace
      return line.replace(/(\s*\[\d+\]\s*)/g,'')
    })
    arr.forEach(line => {
      if (line) newArr.push(line)
    })
    for (var i = 0; i < newArr.length; i++) {
      let line = newArr[i]
      if (i === 0) {
        result = line
        continue
      }
      let prevLine = newArr[i - 1]
      if ((prevLine.match(/[\.\!\?]$/) && line.match(/^[A-Z0-9]/))) {
        result += '\n' + line
      } else {
        result += ' ' + line
      }
    }

    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      },
      body: result
    })
  } catch (err) {
    console.error(err)
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin" : "*"
      },
      body: JSON.stringify(err)
    })
  }
}
