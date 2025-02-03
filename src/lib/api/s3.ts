import { env } from '$env/dynamic/public';

export enum S3Bucket {
    MESSAGES_FILES = "messages-files",
    USERS_AVATARS = "users-avatars",
    WORKSPACES_ICONS = "workspaces-icons",
}

export const getS3ObjectUrl = (bucket: S3Bucket, key: string): string => {
    return `${env.PUBLIC_S3_ORIGIN}/${bucket}/${key}`;
}
