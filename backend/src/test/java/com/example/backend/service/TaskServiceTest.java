package com.example.backend.service;

import com.example.backend.dto.task.TaskRequest;
import com.example.backend.dto.task.TaskResponse;
import com.example.backend.entity.Task;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private final User owner = User.builder().id(1L).email("owner@example.com").build();

    private Task buildTask(boolean completed, String priority) {
        return Task.builder()
                .id(10L)
                .user(owner)
                .text("Buy milk")
                .completed(completed)
                .priority(priority)
                .build();
    }

    @Test
    void createTask_noPriorityGiven_defaultsToMedium() {
        TaskRequest request = new TaskRequest();
        request.setText("Buy milk");

        TaskResponse response = taskService.createTask(owner, request);

        assertThat(response.getPriority()).isEqualTo("medium");
        assertThat(response.isCompleted()).isFalse();
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_priorityGiven_usesRequestedPriority() {
        TaskRequest request = new TaskRequest();
        request.setText("Ship release");
        request.setPriority("high");

        TaskResponse response = taskService.createTask(owner, request);

        assertThat(response.getPriority()).isEqualTo("high");
    }

    @Test
    void updateTask_markCompleted_setsCompletedAt() {
        Task task = buildTask(false, "medium");
        TaskRequest request = new TaskRequest();
        request.setCompleted(true);

        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(task));

        TaskResponse response = taskService.updateTask(owner, 10L, request);

        assertThat(response.isCompleted()).isTrue();
        assertThat(response.getCompletedAt()).isNotNull();
    }

    @Test
    void updateTask_markIncompleteAgain_clearsCompletedAt() {
        Task task = buildTask(true, "medium");
        task.setCompletedAt(java.time.LocalDateTime.now());
        TaskRequest request = new TaskRequest();
        request.setCompleted(false);

        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(task));

        TaskResponse response = taskService.updateTask(owner, 10L, request);

        assertThat(response.isCompleted()).isFalse();
        assertThat(response.getCompletedAt()).isNull();
    }

    @Test
    void updateTask_alreadyCompletedTextOnlyEdit_doesNotResetCompletedAt() {
        Task task = buildTask(true, "medium");
        java.time.LocalDateTime originalCompletedAt = java.time.LocalDateTime.now().minusDays(1);
        task.setCompletedAt(originalCompletedAt);

        TaskRequest request = new TaskRequest();
        request.setText("Buy milk and eggs");
        request.setCompleted(true); // zaten tamamlanmış, tekrar true gönderiliyor

        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(task));

        TaskResponse response = taskService.updateTask(owner, 10L, request);

        assertThat(response.getText()).isEqualTo("Buy milk and eggs");
        assertThat(response.getCompletedAt()).isEqualTo(originalCompletedAt);
    }

    @Test
    void updateTask_taskBelongsToAnotherUser_throwsResourceNotFound() {
        TaskRequest request = new TaskRequest();
        request.setText("hack attempt");

        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> taskService.updateTask(owner, 10L, request));

        verify(taskRepository, never()).save(any());
    }

    @Test
    void deleteTask_existingOwnedTask_deletesIt() {
        Task task = buildTask(false, "low");
        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.of(task));

        taskService.deleteTask(owner, 10L);

        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTask_notFound_throwsResourceNotFound() {
        when(taskRepository.findByIdAndUser(10L, owner)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(owner, 10L));

        verify(taskRepository, never()).delete(any());
    }

    @Test
    void getAllTasks_returnsOnlyThatUsersTasks() {
        Task task = buildTask(false, "medium");
        when(taskRepository.findByUser(owner)).thenReturn(List.of(task));

        List<TaskResponse> tasks = taskService.getAllTasks(owner);

        assertThat(tasks).hasSize(1);
        assertThat(tasks.get(0).getId()).isEqualTo(10L);
    }
}
