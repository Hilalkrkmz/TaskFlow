package com.example.backend.dto.task;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank(message = "Task text is required")
    private String text;

    private Boolean completed;
    private String priority;
}
