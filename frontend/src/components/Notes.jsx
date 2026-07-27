import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Notes({ notes, setNotes }) {
    const [text, setText] = useState("");

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
                            <p className="note-text">{note.text}</p>
                            <div className="note-footer">
                                <span className="note-date">{formatDate(note.createdAt)}</span>
                                <button
                                    className="note-delete-btn"
                                    onClick={() => deleteNote(note.id)}
                                    aria-label="Delete note"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notes;