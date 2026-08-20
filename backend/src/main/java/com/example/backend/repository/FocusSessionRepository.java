package com.example.backend.repository;

import com.example.backend.entity.FocusSession;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    List<FocusSession> findByUserOrderByStartTimeDesc(User user);

    Optional<FocusSession> findByIdAndUser(Long id, User user);
}
