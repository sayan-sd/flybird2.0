import { Link } from "react-router-dom";
import '../stylesheets/ChatPreview.css';

export default function ChatPreview() {
    return (
        <div className="chat-preview-container">
            <div className="chat-preview-header">
                <h2>Recent Chats</h2>
                <Link to="/chats" id="see-all-link">See all</Link>
            </div>
            <div className="chat-preview-list">
                {/* Chat preview items */}

            </div>

            <div className="chat-preview-empty">
            <p>No chats yet.</p>
            </div>
        </div>
    );
}