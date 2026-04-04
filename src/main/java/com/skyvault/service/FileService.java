package com.skyvault.service;

import com.skyvault.entity.FileMetadata;
import com.skyvault.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

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

@Service
public class FileService {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    @Autowired
    private FileMetadataRepository repository;

    // ✅ UPDATED METHOD (with userId)
    public String uploadFile(MultipartFile file, Long userId) {

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        try {
            // ✅ create folder
            File folder = new File("uploads");
            if (!folder.exists()) {
                folder.mkdir();
            }

            // ✅ save locally
            String localPath = "uploads/" + fileName;
            File localFile = new File(localPath);

            FileOutputStream fos = new FileOutputStream(localFile);
            fos.write(file.getBytes());
            fos.close();

            // ✅ upload to S3
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromFile(localFile)
            );

            // ✅ save metadata to DB
            FileMetadata metadata = new FileMetadata();
            metadata.setFileName(fileName);
            metadata.setLocalPath(localPath);
            metadata.setS3Key(fileName);
            metadata.setSize(file.getSize());
            metadata.setUploadTime(LocalDateTime.now());

            // 🔥 IMPORTANT: attach userId
            metadata.setUserId(userId);

            repository.save(metadata);

            return "Uploaded successfully: " + fileName;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    public Resource downloadFile(Long fileId, Long userId) throws IOException {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // 🔐 SECURITY CHECK
        if (!file.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        // LOCAL
        if (file.getLocalPath() != null) {
            Path path = Paths.get(file.getLocalPath());
            return new UrlResource(path.toUri());
        }

        // S3
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getS3Key())
                .build();

        InputStream s3Stream = s3Client.getObject(request);
        return new InputStreamResource(s3Stream);
    }

    public String deleteFile(Long fileId, Long userId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        System.out.println("File userId: " + file.getUserId());
        System.out.println("Request userId: " + userId);

        // 🔐 SECURITY CHECK
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

        // delete S3
        if (file.getS3Key() != null) {
            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key(file.getS3Key()));
        }

        repository.deleteById(fileId);

        return "File deleted successfully";
    }

    public List<FileMetadata> getFilesByUser(Long userId) {
        return repository.findByUserId(userId);
    }
}