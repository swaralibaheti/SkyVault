package com.skyvault.service;

import com.skyvault.entity.FileMetadata; // ✅ ADD THIS
import com.skyvault.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class FileService {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucketName}")
    private String bucketName;

    // ✅ ADD THIS (VERY IMPORTANT)
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
}