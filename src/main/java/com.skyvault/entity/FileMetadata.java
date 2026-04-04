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

    // ✅ SETTER FOR userId (VERY IMPORTANT)

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}