import { ListTodo, Home, Calendar, BarChart2, Palette, Settings, StickyNote, Timer } from "lucide-react";

const menuItems = [
    { key: "home", label: "Home", Icon: Home },
    { key: "calendar", label: "Calendar", Icon: Calendar },
    { key: "notes", label: "Notes", Icon: StickyNote },
    { key: "focus", label: "Focus", Icon: Timer },
    { key: "statistics", label: "Statistics", Icon: BarChart2 },
    { key: "themes", label: "Themes", Icon: Palette },
    { key: "settings", label: "Settings", Icon: Settings }
];

function Sidebar({ view, onNavigate }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <ListTodo size={20} />
                <span>TaskFlow</span>
            </div>

            <nav>
                {menuItems.map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        className={`menu-item ${view === key ? "active" : ""}`}
                        onClick={() => onNavigate(key)}
                    >
                        <Icon size={16} /> {label}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;