package com.example.backend.controller;

import com.example.backend.dto.task.TaskRequest;
import com.example.backend.dto.task.TaskResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        return ResponseEntity.ok(taskService.getAllTasks(principal.getUser()));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody TaskRequest request
    ) {
        TaskResponse response = taskService.createTask(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id,
            @RequestBody TaskRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(principal.getUser(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id
    ) {
        taskService.deleteTask(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}
