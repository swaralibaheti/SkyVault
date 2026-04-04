package com.skyvault.controller;

import com.skyvault.file.FileRepository;
import com.skyvault.repository.UserRepository;
import com.skyvault.security.JwtUtil;
import com.skyvault.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.skyvault.entity.User;
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
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {
        return fileService.uploadFile(file);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {

        Resource resource = fileService.downloadFile(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"file\"")
                .body(resource);
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) {

        String response = fileService.deleteFile(id);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/my-files")
    public ResponseEntity<?> getMyFiles(@RequestHeader("Authorization") String token) {

        String jwt = token.substring(7); // remove "Bearer "
        String username = jwtUtil.extractUsername(jwt);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(fileRepository.findByUserId(user.getId()));
    }
}