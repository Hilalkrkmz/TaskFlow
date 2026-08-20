package com.example.backend.dto.focus;

import com.example.backend.entity.FocusSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusSessionResponse {
    private Long id;
    private FocusSession.Type type;
    private Long taskId;
    private String taskText;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
}
