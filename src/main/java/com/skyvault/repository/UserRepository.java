package com.skyvault.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.skyvault.entity.User;
import java.util.Optional;
import com.skyvault.entity.User;
import com.skyvault.repository.UserRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);



}