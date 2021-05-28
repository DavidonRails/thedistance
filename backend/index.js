var AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: proc.env.accessKeyId,
    secretAccessKey: proc.env.accessKey
});

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async function (event, context, callback) {
    var userAgent = '';
    var htmlLink = '';
    var oss = 'other';

    if (event.hasOwnProperty('headers')) {
        userAgent = event.headers["user-agent"];
    }

    if (userAgent.match("iPhone")) {        
        oss = "ios";    
    } else if (userAgent.match("Android")) {
        oss = "android";
    }
    
    try {

        var params = {
            TableName: 'testmobile',
            Key:{
                "os": oss
            },
            UpdateExpression: `set #count = #count + :val`,
            ExpressionAttributeValues:{
                ":val": 1
            },
            ExpressionAttributeNames:{
                "#count": "count"
            },
            ReturnValues:"UPDATED_NEW"
        };
        
        var data = await updateItem(params);
        
        
        // return { body: data }
    } catch (err) {
        return { error: JSON.stringify(err, null, 2) }
    }
    
    var redirect_url = '';

    switch(oss) {
        case "ios":
            redirect_url = 'https://apps.apple.com/gb/app/jifflr/id1434427409';

            break;
        case "android":
            redirect_url = 'https://play.google.com/store/apps/details?id=uk.jifflr.app&hl=en_GB';
            
            break;
        default:
            redirect_url = 'https://jifflr.com/';
        }

        const response = {
            headers: {
                Location: redirect_url,
                OS : oss,
                Count : data.Attributes.count
            }
        };
        
        return response;

    
};

async function createItem(params){
  try {
    await docClient.put(params).promise();
  } catch (err) {
    return err;
  }
}

async function getItem(params){
  try {
    const data = await docClient.get(params).promise()
    return data
  } catch (err) {
    return err
  }
}

async function updateItem(params) {
  try {
    const data = await docClient.update(params).promise()
    return data
  } catch (err) {
    return err
  }
}

async function queryItems(params){
  try {
    const data = await docClient.query(params).promise()
    return data
  } catch (err) {
    return err
  }
}

async function listItems(params){
  try {
    const data = await docClient.scan(params).promise()
    return data
  } catch (err) {
    return err
  }
}
