export interface User {
    id: number;
    username: string;
    email: string;
}

export interface FileMetadata {
    id: number;
    fileName: string;
    fileType?: string;
    size?: number;
    uploadTime: string;
    s3Key?: string;
    shareToken?: string;        // ← NEW
    sharePassword?: string;     // ← NEW (only for internal use)
}

export interface AuthResponse {
    token: string;
}