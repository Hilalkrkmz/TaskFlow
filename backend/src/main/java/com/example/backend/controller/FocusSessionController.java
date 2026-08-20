package com.example.backend.controller;

import com.example.backend.dto.focus.FocusSessionRequest;
import com.example.backend.dto.focus.FocusSessionResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.FocusSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/focus-sessions")
@RequiredArgsConstructor
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    @GetMapping
    public ResponseEntity<List<FocusSessionResponse>> getAllSessions(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        return ResponseEntity.ok(focusSessionService.getAllSessions(principal.getUser()));
    }

    @PostMapping
    public ResponseEntity<FocusSessionResponse> createSession(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody FocusSessionRequest request
    ) {
        FocusSessionResponse response = focusSessionService.createSession(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
