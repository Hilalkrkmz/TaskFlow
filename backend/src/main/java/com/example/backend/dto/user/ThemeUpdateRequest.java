package com.example.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ThemeUpdateRequest {

    @NotBlank(message = "Theme is required")
    private String theme;
}
