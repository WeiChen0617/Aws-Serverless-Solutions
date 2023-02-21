import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequestError, InternalServerError } from 'ts-http-errors';
const client = new SESClient({ region: 'ap-east-1' });

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const message = 'Hi it is a email reminder';
      const params = {
            Destination: {
                  ToAddresses: ['target@gmail.com'],
            },
            Message: {
                  Body: { Text: { Data: message } },
                  Subject: { Data: 'reminder email' },
            },
            Source: 'from@gmail.com',
      }
      try {
            await client.send(new SendEmailCommand(params));
            return {
                  statusCode: 200,
                  body: JSON.stringify({
                        success: true,
                        message: 'Send email successfully',
                  }),
            };
      } catch (error) {
            console.log('error:', error)
            throw new InternalServerError('Internal server error')
      }
};
