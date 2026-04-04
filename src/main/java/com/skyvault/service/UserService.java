package com.skyvault.service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skyvault.entity.User;
import com.skyvault.repository.UserRepository;

import java.util.Optional;
import com.skyvault.dto.LoginRequest;

import com.skyvault.security.JwtUtil;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User saveUser(User user) {

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public String loginUser(LoginRequest request) {

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {

            User user = userOptional.get();

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {

                // ✅ Generate JWT Token
                return jwtUtil.generateToken(user.getId());

            } else {
                throw new RuntimeException("Invalid Password");
            }

        } else {
            throw new RuntimeException("User not found");
        }
    }
}
