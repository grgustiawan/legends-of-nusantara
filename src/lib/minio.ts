import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9200'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gacha';

export async function initializeMinio() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');

      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Action: ['s3:GetObject'],
            Effect: 'Allow',
            Principal: '*',
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`Bucket ${BUCKET_NAME} created and policy set to public read.`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
}

export async function uploadFileToMinio(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
  try {
    await initializeMinio();

    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, {
      'Content-Type': contentType,
    });

    const publicEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || `http://localhost:9200/${BUCKET_NAME}`;
    return `${publicEndpoint}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file');
  }
}
