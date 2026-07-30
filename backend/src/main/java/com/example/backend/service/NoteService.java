package com.example.backend.service;

import com.example.backend.dto.note.NoteRequest;
import com.example.backend.dto.note.NoteResponse;
import com.example.backend.entity.Note;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;

    public List<NoteResponse> getAllNotes(User user) {
        return noteRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public NoteResponse createNote(User user, NoteRequest request) {
        Note note = Note.builder()
                .user(user)
                .text(request.getText())
                .build();

        noteRepository.save(note);
        return toResponse(note);
    }

    public void deleteNote(User user, Long noteId) {
        Note note = noteRepository.findByIdAndUser(noteId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        noteRepository.delete(note);
    }

    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .text(note.getText())
                .createdAt(note.getCreatedAt())
                .build();
    }
}

