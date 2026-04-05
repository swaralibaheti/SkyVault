package com.skyvault.service;

import com.skyvault.entity.FileMetadata;
import com.skyvault.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.InputStreamResource;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;
import software.amazon.awssdk.regions.Region;
import java.time.Duration;

@Service
public class FileService {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    @Autowired
    private FileMetadataRepository repository;

    @Autowired
    private S3Presigner presigner;

    // ✅ UPLOAD FILE
    public String uploadFile(MultipartFile file, Long userId) {

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        try {
            File folder = new File("uploads");
            if (!folder.exists()) {
                folder.mkdir();
            }

            String localPath = "uploads/" + fileName;
            File localFile = new File(localPath);

            FileOutputStream fos = new FileOutputStream(localFile);
            fos.write(file.getBytes());
            fos.close();

            // upload to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromFile(localFile)
            );

            // save metadata
            FileMetadata metadata = new FileMetadata();
            metadata.setFileName(fileName);
            metadata.setLocalPath(localPath);
            metadata.setS3Key(fileName);
            metadata.setSize(file.getSize());
            metadata.setUploadTime(LocalDateTime.now());
            metadata.setUserId(userId);

            repository.save(metadata);

            return "Uploaded successfully: " + fileName;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    // ✅ DOWNLOAD FILE
    public Resource downloadFile(Long fileId, Long userId) throws IOException {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        // Try local first
        if (file.getLocalPath() != null) {
            Path path = Paths.get(file.getLocalPath());

            if (path.toFile().exists()) {
                return new UrlResource(path.toUri());
            }
        }

        // fallback to S3
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getS3Key())
                .build();

        InputStream s3Stream = s3Client.getObject(request);
        return new InputStreamResource(s3Stream);
    }

    // ✅ DELETE FILE
    public String deleteFile(Long fileId, Long userId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized delete attempt");
        }

        // delete local
        if (file.getLocalPath() != null) {
            File localFile = new File(file.getLocalPath());
            if (localFile.exists()) {
                localFile.delete();
            }
        }

        // delete from S3
        if (file.getS3Key() != null) {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(file.getS3Key())
                    .build();

            s3Client.deleteObject(deleteRequest);
        }

        repository.deleteById(fileId);

        return "File deleted successfully";
    }

    // ✅ GET USER FILES
    public List<FileMetadata> getFilesByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    // 🔥 FIXED PRESIGNED URL METHOD
    public String generatePresignedUrl(String key) {

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(5))
                        .getObjectRequest(getObjectRequest)
                        .build();

        PresignedGetObjectRequest presignedRequest =
                presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }

    // ✅ SECURE WRAPPER
    public String generatePresignedUrl(Long fileId, Long userId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return generatePresignedUrl(file.getS3Key());
    }
}