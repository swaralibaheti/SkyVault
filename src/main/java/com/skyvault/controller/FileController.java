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

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String token = header.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        fileService.uploadFile(file, userId);

        return ResponseEntity.ok("File uploaded successfully!");
    }

    // ✅ DOWNLOAD FILE (SECURED)
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            HttpServletRequest request) throws IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(null);
        }

        String token = header.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        Resource resource = fileService.downloadFile(id, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"file\"")
                .body(resource);
    }

    // ✅ DELETE FILE (SECURED 🔐)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(
            @PathVariable Long id,
            HttpServletRequest request) {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String token = header.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        String response = fileService.deleteFile(id, userId);

        return ResponseEntity.ok(response);
    }

    // ✅ GET USER FILES
    @GetMapping("/my-files")
    public ResponseEntity<?> getMyFiles(HttpServletRequest request) {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String token = header.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        return ResponseEntity.ok(fileService.getFilesByUser(userId));
    }
}