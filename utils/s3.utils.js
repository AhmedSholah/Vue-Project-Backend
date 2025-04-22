const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

async function getDownloadUrl(fileName, isPrivate = false) {
    if (isPrivate) {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_PRIVATE_BUCKET_NAME,
            Key: fileName,
        });

        try {
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: 5,
            });

            return url;
        } catch (error) {
            throw new Error(error);
        }
    } else {
        return process.env.AWS_S3_PUBLIC_BUCKET_URL + fileName;
    }
}

async function getUploadUrl(fileName, fileType, buffer, isPrivate = false) {
    const bucketName = isPrivate
        ? process.env.AWS_S3_PRIVATE_BUCKET_NAME
        : process.env.AWS_S3_PUBLIC_BUCKET_NAME;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${fileName} ${fileType}`,
        Body: buffer,
        ContentType: fileType,
    });

    try {
        const url = await getSignedUrl(s3Client, command, {
            expiresIn: 1000,
        });
        return url;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = { getUploadUrl, getDownloadUrl, s3Client };
