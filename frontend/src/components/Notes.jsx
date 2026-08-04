import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Notes({ notes, setNotes }) {
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const addNote = () => {
        if (!text.trim()) return;

        const newNote = {
            id: Date.now(),
            text: text,
            createdAt: new Date().toISOString()
        };

        setNotes([newNote, ...notes]);
        setText("");
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const startEditing = (note) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = (id) => {
        if (!editText.trim()) return;

        setNotes(
            notes.map(note =>
                note.id === id ? { ...note, text: editText } : note
            )
        );
        setEditingId(null);
        setEditText("");
    };

    return (
        <div className="notes-page">
            <h2 className="notes-title">Notes</h2>

            <div className="notes-form-card">
                <textarea
                    className="notes-textarea"
                    placeholder="Write a quick note..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            addNote();
                        }
                    }}
                    rows={3}
                />
                <button className="notes-add-btn" onClick={addNote}>
                    <Plus size={15} /> Add Note
                </button>
            </div>

            {notes.length === 0 ? (
                <p className="notes-empty-msg">No notes yet. Add your first one above.</p>
            ) : (
                <div className="notes-grid">
                    {notes.map(note => (
                        <div key={note.id} className="note-card">
                            {editingId === note.id ? (
                                <>
                                    <textarea
                                        className="notes-textarea note-edit-textarea"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="note-edit-actions">
                                        <button
                                            className="note-save-btn"
                                            onClick={() => saveEdit(note.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="note-cancel-btn"
                                            onClick={cancelEditing}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="note-text">{note.text}</p>
                                    <div className="note-footer">
                                        <span className="note-date">{formatDate(note.createdAt)}</span>
                                        <div className="note-actions">
                                            <button
                                                className="note-edit-btn"
                                                onClick={() => startEditing(note)}
                                                aria-label="Edit note"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                className="note-delete-btn"
                                                onClick={() => deleteNote(note.id)}
                                                aria-label="Delete note"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notes;