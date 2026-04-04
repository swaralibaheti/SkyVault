package com.skyvault.entity;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    // ✅ GETTERS & SETTERS

    public Long getId() {
        return id;
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

}