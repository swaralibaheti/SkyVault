package com.skyvault.repository;

import com.skyvault.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByUserId(Long userId);

    Optional<FileMetadata> findByShareToken(String shareToken);

}