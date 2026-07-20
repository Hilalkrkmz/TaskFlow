import { ListTodo, Home, Calendar, BarChart2, Palette, Settings } from "lucide-react";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <ListTodo size={20} />
                <span>TaskFlow</span>
            </div>

            <nav>
                <button className="menu-item active">
                    <Home size={16} /> Home
                </button>
                <button className="menu-item">
                    <Calendar size={16} /> Calendar
                </button>
                <button className="menu-item">
                    <BarChart2 size={16} /> Statistics
                </button>
                <button className="menu-item">
                    <Palette size={16} /> Themes
                </button>
                <button className="menu-item">
                    <Settings size={16} /> Settings
                </button>
            </nav>
        </aside>
    );
}

export default Sidebar;