package com.example.backend.service;

import com.example.backend.dto.task.TaskRequest;
import com.example.backend.dto.task.TaskResponse;
import com.example.backend.entity.Task;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<TaskResponse> getAllTasks(User user) {
        return taskRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse createTask(User user, TaskRequest request) {
        Task task = Task.builder()
                .user(user)
                .text(request.getText())
                .completed(false)
                .priority(request.getPriority() != null ? request.getPriority() : "medium")
                .build();

        taskRepository.save(task);
        return toResponse(task);
    }

    public TaskResponse updateTask(User user, Long taskId, TaskRequest request) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (request.getText() != null) {
            task.setText(request.getText());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getCompleted() != null) {
            boolean wasCompleted = task.isCompleted();
            boolean nowCompleted = request.getCompleted();

            task.setCompleted(nowCompleted);

            // Tamamlandı olarak işaretlendiyse şimdiki zamanı kaydet,
            // tekrar aktif yapıldıysa completedAt'i temizle.
            // Zaten tamamlanmış bir görev tekrar "true" ile güncellenirse
            // (örn. sadece text değişikliği) tarihi bozmuyoruz.
            if (!wasCompleted && nowCompleted) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (wasCompleted && !nowCompleted) {
                task.setCompletedAt(null);
            }
        }

        taskRepository.save(task);
        return toResponse(task);
    }

    public void deleteTask(User user, Long taskId) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .text(task.getText())
                .completed(task.isCompleted())
                .priority(task.getPriority())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .build();
    }
}
