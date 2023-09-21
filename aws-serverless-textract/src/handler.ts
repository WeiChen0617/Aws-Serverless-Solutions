import { APIGatewayProxyHandler } from "aws-lambda";
import { S3, Textract } from "aws-sdk";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

export const extractPhoneNumber: APIGatewayProxyHandler = async (event) => {
  const s3 = new S3();
  const textract = new TextractClient({ region: process.env.AWS_REGION });

  // 从事件负载中获取图片路径和存储桶名称
  const { key, bucket } = JSON.parse(event.body);

  // 从 S3 中下载图片
  const imageBuffer = await s3.getObject({ Bucket: bucket, Key: key }).promise();

  // 使用 AWS Textract 提取文本
  const command = new DetectDocumentTextCommand({
    Document: {
      Bytes: imageBuffer.Body,
    },
  });
  const result = await textract.send(command);

  // 从识别结果中提取电话号码
  const phoneNumberRegex = /(\+?\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const phoneNumberMatches = result.Blocks?.filter((b) => b.BlockType === "LINE")
    .map((b) => b.Text)
    .join("\n")
    .match(phoneNumberRegex);

  if (phoneNumberMatches && phoneNumberMatches.length > 0) {
    return {
      statusCode: 200,
      body: phoneNumberMatches[0],
    };
  } else {
    return {
      statusCode: 404,
      body: "No phone number found in image",
    };
  }
};
