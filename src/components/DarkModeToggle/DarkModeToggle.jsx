import { Moon, Sun } from 'lucide-react';
import './DarkModeToggle.css';

export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      className="dark-mode-toggle"
      onClick={onToggle}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
