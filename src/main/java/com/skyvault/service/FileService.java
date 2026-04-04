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

@Service
public class FileService {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    @Autowired
    private FileMetadataRepository repository;

    public String uploadFile(MultipartFile file) {

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

            repository.save(metadata);

            return "Uploaded successfully: " + fileName;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }
    public Resource downloadFile(Long fileId) throws IOException {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // LOCAL FILE
        if (file.getLocalPath() != null) {
            Path path = Paths.get(file.getLocalPath());
            return new UrlResource(path.toUri());
        }

        // S3 FILE
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getS3Key())
                .build();

        InputStream s3Stream = s3Client.getObject(getObjectRequest);
        return new InputStreamResource(s3Stream);
    }
    public String deleteFile(Long fileId) {

        FileMetadata file = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // 🔹 Delete local file
        if (file.getLocalPath() != null) {
            File localFile = new File(file.getLocalPath());
            if (localFile.exists()) {
                localFile.delete();
            }
        }

        // 🔹 Delete from S3
        if (file.getS3Key() != null) {
            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key(file.getS3Key())
            );
        }

        // 🔹 Delete from DB
        repository.deleteById(fileId);

        return "File deleted successfully";
    }
}