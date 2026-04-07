package com.skyvault.entity;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 IMPORTANT: user ownership
    private Long userId;

    @Setter
    private String fileName;

    @Setter
    private String localPath;

    @Setter
    private String s3Key;

    @Setter
    private long size;

    @Setter
    private LocalDateTime uploadTime;

    // 🔥 NEW FIELD (for sharing)
    private String shareToken;

    private String sharePassword;

    // ✅ GETTERS

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFileName() {
        return fileName;
    }

    public String getLocalPath() {
        return localPath;
    }

    public String getS3Key() {
        return s3Key;
    }

    public long getSize() {
        return size;
    }

    public LocalDateTime getUploadTime() {
        return uploadTime;
    }

    public String getShareToken() {
        return shareToken;
    }

    // ✅ SETTERS

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // 🔥 REQUIRED FIX
    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public String getSharePassword() {
        return sharePassword;
    }

    public void setSharePassword(String sharePassword) {
        this.sharePassword = sharePassword;
    }


}