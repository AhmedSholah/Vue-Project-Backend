const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_PUBLIC_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
    });
    await s3Client.send(command);
    return `${process.env.AWS_S3_PUBLIC_BUCKET_URL}/${fileName}`;
};

module.exports = { uploadToS3 };
