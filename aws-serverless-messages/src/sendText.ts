import { PublishCommand, SetSMSAttributesCommand, SNSClient } from '@aws-sdk/client-sns';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequestError, InternalServerError } from 'ts-http-errors';
const client = new SNSClient({ region: 'eu-west-2' });

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const { phone, message } = JSON.parse(event.body || '')
      if (!phone || !message) {
            throw new BadRequestError('Bad request error.');
      }
      // const attributeParams = {
      //       attributes: {
      //             DefaultSMSType: 'Promotional',
      //       },
      // };
      const messageParams = {
            Message: message,
            PhoneNumber: phone,
      }
      console.log('参数：', messageParams);

      try {
            // await client.send(new SetSMSAttributesCommand(attributeParams));
            await client.send(new PublishCommand(messageParams))
            return {
                  statusCode: 200,
                  body: JSON.stringify({
                        success: true,
                        message: `Send text to ${phone} successfully`,
                  }),
            };
      } catch (error) {
            console.log('error:', error)
            throw new InternalServerError('Internal server error')
      }
};
