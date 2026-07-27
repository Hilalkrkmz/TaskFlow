import { useState, useRef } from "react";
import { Trash2, TriangleAlert, Download, Upload, Info, Save } from "lucide-react";

function Settings({ tasks, setTasks }) {
    const [confirming, setConfirming] = useState(false);
    const fileInputRef = useRef(null);

    const handleReset = () => {
        setTasks([]);
        localStorage.removeItem("tasks");
        setConfirming(false);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "taskflow-export.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (!Array.isArray(parsed)) {
                    alert("Invalid file format: a task list was expected.");
                    return;
                }
                setTasks(parsed);
            } catch {
                alert("Couldn't read the file. Please check the JSON format.");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    return (
        <div className="settings-page">
            <h2 className="settings-title">Settings</h2>

            <div className="settings-panel">
                <p className="settings-panel-title">
                    <Save size={15} /> Data
                </p>

                <div className="settings-row">
                    <div>
                        <p className="settings-row-title">Export Tasks (JSON)</p>
                        <p className="settings-row-desc">Download all your tasks as a JSON file.</p>
                    </div>
                    <button className="settings-btn" onClick={handleExport}>
                        <Download size={15} /> Export
                    </button>
                </div>

                <div className="settings-row">
                    <div>
                        <p className="settings-row-title">Import Tasks</p>
                        <p className="settings-row-desc">Restore tasks from a previously exported JSON file.</p>
                    </div>
                    <button className="settings-btn" onClick={handleImportClick}>
                        <Upload size={15} /> Import
                    </button>
                    <input
                        type="file"
                        accept="application/json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>

                <div className="settings-row">
                    <div>
                        <p className="settings-row-title">Clear All Tasks</p>
                        <p className="settings-row-desc">
                            Permanently deletes all tasks. The Calendar and Statistics pages will also be reset.
                        </p>
                    </div>

                    {!confirming ? (
                        <button className="settings-danger-btn" onClick={() => setConfirming(true)}>
                            <Trash2 size={15} /> Clear
                        </button>
                    ) : (
                        <div className="settings-confirm">
                            <span className="settings-confirm-text">
                                <TriangleAlert size={14} /> Are you sure?
                            </span>
                            <button className="settings-danger-btn" onClick={handleReset}>
                                Yes, delete
                            </button>
                            <button className="settings-cancel-btn" onClick={() => setConfirming(false)}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-panel">
                <p className="settings-panel-title">
                    <Info size={15} /> About
                </p>
                <div className="settings-about">
                    <p><strong>TaskFlow</strong> v1.0</p>
                    <p>Created by Hilal Korkmaz</p>
                    <p className="settings-about-muted">React + Electron + LocalStorage</p>
                </div>
            </div>
        </div>
    );
}

export default Settings;