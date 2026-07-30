package com.example.backend.controller;

import com.example.backend.dto.user.ThemeUpdateRequest;
import com.example.backend.dto.user.UserResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        return ResponseEntity.ok(userService.getCurrentUser(principal.getUser()));
    }

    @PatchMapping("/me/theme")
    public ResponseEntity<UserResponse> updateTheme(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody ThemeUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.updateTheme(principal.getUser(), request.getTheme()));
    }
}
