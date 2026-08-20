package com.example.backend.service;

import com.example.backend.dto.focus.FocusSessionRequest;
import com.example.backend.dto.focus.FocusSessionResponse;
import com.example.backend.entity.FocusSession;
import com.example.backend.entity.Task;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FocusSessionRepository;
import com.example.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;

    public List<FocusSessionResponse> getAllSessions(User user) {
        return focusSessionRepository.findByUserOrderByStartTimeDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FocusSessionResponse createSession(User user, FocusSessionRequest request) {
        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findByIdAndUser(request.getTaskId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        }

        FocusSession session = FocusSession.builder()
                .user(user)
                .task(task)
                .type(request.getType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationSeconds(request.getDurationSeconds())
                .build();

        focusSessionRepository.save(session);
        return toResponse(session);
    }

    public void deleteSession(User user, Long id) {
        FocusSession session = focusSessionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        focusSessionRepository.delete(session);
    }

    private FocusSessionResponse toResponse(FocusSession session) {
        return FocusSessionResponse.builder()
                .id(session.getId())
                .type(session.getType())
                .taskId(session.getTask() != null ? session.getTask().getId() : null)
                .taskText(session.getTask() != null ? session.getTask().getText() : null)
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .durationSeconds(session.getDurationSeconds())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
