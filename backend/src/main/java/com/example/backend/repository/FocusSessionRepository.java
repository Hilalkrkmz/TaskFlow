package com.example.backend.repository;

import com.example.backend.entity.FocusSession;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    // task LAZY - open-in-view:false oldugu icin transaction disinda erisilirse
    // LazyInitializationException firlatiyordu. JOIN FETCH ile bastan getiriyoruz.
    @Query("SELECT fs FROM FocusSession fs LEFT JOIN FETCH fs.task WHERE fs.user = :user ORDER BY fs.startTime DESC")
    List<FocusSession> findByUserOrderByStartTimeDesc(@Param("user") User user);

    Optional<FocusSession> findByIdAndUser(Long id, User user);
}
