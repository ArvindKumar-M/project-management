"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fetchAuthSession } from "aws-amplify/auth";
import crypto from "crypto";

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string; key: string } }
  | { failure: string; success?: undefined }
>;

const allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const maxSize = 1024 * 1024 * 10; //10MB

const s3Client = new S3Client({
  region: process.env.MY_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.MY_ACCESS_KEY!,
    secretAccessKey: process.env.MY_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string,
  userId: number | undefined,
): SignedURLResponse {
  const session = await fetchAuthSession();
  if (!session) {
    return { failure: "Not authenticated" };
  }
  if (userId === undefined) {
    throw new Error("User ID is required to generate a signed URL.");
  }

  if (!allowedFileTypes.includes(type)) {
    return { failure: "Invalid file type" };
  }

  if (size > maxSize) {
    return { failure: "File too large" };
  }

  const fileKey = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.MY_BUCKET_NAME!,
    Key: fileKey,
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    Metadata: {
      userId: userId?.toString(),
    },
  });

  const url = await getSignedUrl(
    s3Client,
    putObjectCommand,
    { expiresIn: 60 }, // 60 seconds
  );

  return { success: { url, key: fileKey } };
}
