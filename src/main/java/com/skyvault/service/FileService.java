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

    // ✅ UPLOAD
    public String uploadFile(MultipartFile file, Long userId) {

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        try {
            File folder = new File("uploads");
            if (!folder.exists()) folder.mkdir();

            String localPath = "uploads/" + fileName;
            File localFile = new File(localPath);

            FileOutputStream fos = new FileOutputStream(localFile);
            fos.write(file.getBytes());
            fos.close();

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromFile(localFile));

            FileMetadata metadata = new FileMetadata();
            metadata.setFileName(fileName);
            metadata.setLocalPath(localPath);
            metadata.setS3Key(fileName);
            metadata.setSize(file.getSize());
            metadata.setUploadTime(LocalDateTime.now());
            metadata.setUserId(userId);

            repository.save(metadata);

            return "Uploaded successfully";

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // ✅ DOWNLOAD
    public Resource downloadFile(Long fileId, Long userId) throws IOException {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (file.getLocalPath() != null) {
            Path path = Paths.get(file.getLocalPath());
            if (path.toFile().exists()) {
                return new UrlResource(path.toUri());
            }
        }

        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getS3Key())
                .build();

        InputStream stream = s3Client.getObject(request);
        return new InputStreamResource(stream);
    }

    // ✅ DELETE
    public String deleteFile(Long fileId, Long userId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (file.getLocalPath() != null) {
            File local = new File(file.getLocalPath());
            if (local.exists()) local.delete();
        }

        if (file.getS3Key() != null) {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(file.getS3Key())
                    .build();

            s3Client.deleteObject(deleteRequest);
        }

        repository.deleteById(fileId);
        return "Deleted";
    }

    // ✅ GET FILES
    public List<FileMetadata> getFilesByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    // ✅ PRESIGNED URL
    public String generatePresignedUrl(String key) {

        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(5))
                        .getObjectRequest(request)
                        .build();

        return presigner.presignGetObject(presignRequest)
                .url()
                .toString();
    }

    public String generatePresignedUrl(Long fileId, Long userId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        return generatePresignedUrl(file.getS3Key());
    }

    // ✅ SHARE LINK WITH PASSWORD
    public String generateShareLink(Long fileId, Long userId, String password) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        String token = java.util.UUID.randomUUID().toString();

        file.setShareToken(token);
        file.setSharePassword(password);

        repository.save(file);

        return "http://localhost:8080/files/public/" + token;
    }

    // ✅ ACCESS SHARED FILE
    public String getFileByShareToken(String token, String password) {

        FileMetadata file = repository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid link"));

        if (file.getSharePassword() == null || !file.getSharePassword().equals(password)) {
            throw new RuntimeException("Wrong password");
        }

        return generatePresignedUrl(file.getS3Key());
    }
}