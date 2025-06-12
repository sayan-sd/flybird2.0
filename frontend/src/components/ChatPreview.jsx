import { Link } from "react-router-dom";

const ChatPreview = () =>  {


    return (
        <div className="chat-preview-container">
            <div className="chat-preview-header">
                <h2>Recent Chats</h2>
                <Link to="/chats" id="see-all-link">See all</Link>
            </div>

            <div className="chat-preview-empty">
                <p>No chats yet.</p>
            </div>   
        </div>
    );
}

export default ChatPreview;