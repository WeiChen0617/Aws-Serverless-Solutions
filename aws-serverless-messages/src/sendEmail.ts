import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequestError, InternalServerError } from 'ts-http-errors';
const client = new SESClient({ region: 'eu-west-2' });

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      console.log('参数event:', event);
      const { to, from, subject, text } = JSON.parse(event.body || '')
      console.log('参数:', to, from, subject, text);

      if (!to || !from || !subject || !text) {
            throw new BadRequestError('Bad request error.');
      }
      const params = {
            Destination: {
                  ToAddresses: [to],
            },
            Message: {
                  Body: {
                        Text: { Data: text },
                  },
                  Subject: { Data: subject },
            },
            Source: from,
      };
      try {
            await client.send(new SendEmailCommand(params));
            return {
                  statusCode: 200,
                  body: JSON.stringify({
                        success: true,
                        message: `Send email to ${to} successfully`,
                  }),
            };
      } catch (error) {
            console.log('error:', error)
            throw new InternalServerError('Internal server error')
      }
};
