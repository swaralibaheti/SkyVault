package com.skyvault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.skyvault.entity.User;
import com.skyvault.service.UserService;

import com.skyvault.dto.LoginRequest;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody LoginRequest request) {
        return userService.loginUser(request);
    }
}
