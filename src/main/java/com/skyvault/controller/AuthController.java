package com.skyvault.controller;

import com.skyvault.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        // ⚠️ TEMP LOGIN (no DB check yet)
        if (username != null && password != null) {

            String token = jwtUtil.generateToken(username);

            return ResponseEntity.ok(Map.of("token", token));
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }
}