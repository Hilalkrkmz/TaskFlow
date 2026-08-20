package com.example.backend.dto.focus;

import com.example.backend.entity.FocusSession;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FocusSessionRequest {

    @NotNull(message = "Session type is required")
    private FocusSession.Type type;

    private Long taskId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationSeconds;
}
