package com.example.backend.dto.note;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoteRequest {

    @NotBlank(message = "Note text is required")
    private String text;
}