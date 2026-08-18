package com.example.backend.service;

import com.example.backend.dto.note.NoteRequest;
import com.example.backend.dto.note.NoteResponse;
import com.example.backend.entity.Note;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.NoteRepository;
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
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @InjectMocks
    private NoteService noteService;

    private final User owner = User.builder().id(1L).email("owner@example.com").build();

    private Note buildNote() {
        return Note.builder()
                .id(20L)
                .user(owner)
                .text("Remember the milk")
                .build();
    }

    @Test
    void createNote_savesAndReturnsNote() {
        NoteRequest request = new NoteRequest();
        request.setText("Remember the milk");

        NoteResponse response = noteService.createNote(owner, request);

        assertThat(response.getText()).isEqualTo("Remember the milk");
        verify(noteRepository).save(any(Note.class));
    }

    @Test
    void updateNote_ownedNote_updatesText() {
        Note note = buildNote();
        NoteRequest request = new NoteRequest();
        request.setText("Remember the milk and eggs");

        when(noteRepository.findByIdAndUser(20L, owner)).thenReturn(Optional.of(note));

        NoteResponse response = noteService.updateNote(owner, 20L, request);

        assertThat(response.getText()).isEqualTo("Remember the milk and eggs");
        verify(noteRepository).save(note);
    }

    @Test
    void updateNote_belongsToAnotherUser_throwsResourceNotFound() {
        NoteRequest request = new NoteRequest();
        request.setText("hack attempt");

        when(noteRepository.findByIdAndUser(20L, owner)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.updateNote(owner, 20L, request));

        verify(noteRepository, never()).save(any());
    }

    @Test
    void deleteNote_ownedNote_deletesIt() {
        Note note = buildNote();
        when(noteRepository.findByIdAndUser(20L, owner)).thenReturn(Optional.of(note));

        noteService.deleteNote(owner, 20L);

        verify(noteRepository).delete(note);
    }

    @Test
    void deleteNote_notFound_throwsResourceNotFound() {
        when(noteRepository.findByIdAndUser(20L, owner)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> noteService.deleteNote(owner, 20L));

        verify(noteRepository, never()).delete(any());
    }

    @Test
    void getAllNotes_returnsUsersNotes() {
        Note note = buildNote();
        when(noteRepository.findByUser(owner)).thenReturn(List.of(note));

        List<NoteResponse> notes = noteService.getAllNotes(owner);

        assertThat(notes).hasSize(1);
        assertThat(notes.get(0).getText()).isEqualTo("Remember the milk");
    }
}
