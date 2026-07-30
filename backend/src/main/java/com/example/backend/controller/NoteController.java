package com.example.backend.controller;

import com.example.backend.dto.note.NoteRequest;
import com.example.backend.dto.note.NoteResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotes(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        return ResponseEntity.ok(noteService.getAllNotes(principal.getUser()));
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody NoteRequest request
    ) {
        NoteResponse response = noteService.createNote(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable Long id
    ) {
        noteService.deleteNote(principal.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}

