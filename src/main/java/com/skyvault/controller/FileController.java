package com.skyvault.controller;

import com.skyvault.security.JwtUtil;
import com.skyvault.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FileService fileService;

    // ✅ UPLOAD FILE
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        fileService.uploadFile(file, userId);

        return ResponseEntity.ok("File uploaded successfully!");
    }

    // ✅ DOWNLOAD FILE (DIRECT)
    @GetMapping("/download-file/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            HttpServletRequest request) throws IOException {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        Resource resource = fileService.downloadFile(id, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"file\"")
                .body(resource);
    }

    // ✅ DELETE FILE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(
            @PathVariable Long id,
            HttpServletRequest request) {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        String response = fileService.deleteFile(id, userId);

        return ResponseEntity.ok(response);
    }

    // ✅ GET USER FILES
    @GetMapping("/my-files")
    public ResponseEntity<?> getMyFiles(HttpServletRequest request) {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        return ResponseEntity.ok(fileService.getFilesByUser(userId));
    }

    // ✅ PRE-SIGNED URL
    @GetMapping("/download/{fileId}")
    public ResponseEntity<?> getDownloadUrl(
            @PathVariable Long fileId,
            HttpServletRequest request) {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        String url = fileService.generatePresignedUrl(fileId, userId);

        return ResponseEntity.ok(url);
    }

    // 🔥 PASSWORD PROTECTED SHARE LINK
    @GetMapping("/share/{fileId}")
    public ResponseEntity<?> generateShareLink(
            @PathVariable Long fileId,
            @RequestParam String password,
            HttpServletRequest request) {

        String token = jwtUtil.extractToken(request);
        Long userId = jwtUtil.extractUserId(token);

        String link = fileService.generateShareLink(fileId, userId, password);

        return ResponseEntity.ok(link);
    }

    // 🔥 PUBLIC ACCESS WITH PASSWORD
    @GetMapping("/public/{token}")
    public ResponseEntity<?> accessSharedFile(
            @PathVariable String token,
            @RequestParam String password) {

        String url = fileService.getFileByShareToken(token, password);

        return ResponseEntity.status(302)
                .header("Location", url)
                .build();
    }
}