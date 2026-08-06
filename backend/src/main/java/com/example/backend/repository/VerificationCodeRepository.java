package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {

    Optional<VerificationCode> findTopByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(
            User user, VerificationCode.Type type
    );
}
