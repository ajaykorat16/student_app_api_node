const AWS = require('aws-sdk');
const config = {
  apiVersion: '2010-12-01',
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.SECRETKEY,
  region: process.env.REGION
};

module.exports = {
  sendSms: async (to, body, subject) => {

    var smsTypeParams = {
      attributes: { /* required */
        'DefaultSMSType': 'Transactional', /* highest reliability */
        //'DefaultSMSType': 'Promotional' /* lowest cost */
      }
    };

    var params = {
      Message: body,
      PhoneNumber: '91' + to,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          'DataType': 'String',
          'StringValue': subject
        }
      }
    };

    await new AWS.SNS(config).setSMSAttributes(smsTypeParams).promise();

    return new AWS.SNS(config).publish(params).promise();

  },
  sendEmail: (from, to, subject, text) => {
    var params = {
      Source: from,
      Destination: {
        ToAddresses: [
          to
        ]
      },
      ReplyToAddresses: [
        from,
      ],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: text
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    };

    return new AWS.SES(config).sendEmail(params).promise();
  }
};
