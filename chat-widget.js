/**
 * SevaSetu Real-Time Live Chat Widget
 * Connects Donors, Support, & Ashram Managers via WebSockets
 */

(function(){
    // Prevent duplicate injection
    if(document.getElementById('sevasetu-chat-root')) return;

    // Load FontAwesome if not loaded
    if(!document.querySelector('link[href*="font-awesome"]')){
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        #sevasetu-chat-root {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 999999;
            font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        }
        .ss-chat-toggle {
            display: flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #ff7b00, #ff5500);
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 50px;
            border: 2px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 25px rgba(255, 123, 0, 0.45);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-weight: 600;
            font-size: 14px;
            user-select: none;
        }
        .ss-chat-toggle:hover {
            transform: scale(1.05) translateY(-3px);
            box-shadow: 0 12px 30px rgba(255, 123, 0, 0.65);
        }
        .ss-chat-toggle .ss-chat-icon {
            font-size: 18px;
            position: relative;
        }
        .ss-unread-badge {
            position: absolute;
            top: -8px;
            right: -10px;
            background: #ef4444;
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 10px;
            padding: 2px 6px;
            border: 2px solid #011232;
            display: none;
        }
        .ss-chat-window {
            position: absolute;
            bottom: 60px;
            right: 0;
            width: 380px;
            max-width: 90vw;
            height: 520px;
            max-height: 80vh;
            background: rgba(1, 18, 50, 0.96);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 123, 0, 0.4);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ss-chat-window.open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }
        .ss-chat-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, rgba(255, 123, 0, 0.2), rgba(1, 18, 50, 0.8));
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .ss-chat-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .ss-chat-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff7b00, #ff9900);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #011232;
            font-size: 18px;
            font-weight: 700;
        }
        .ss-chat-info h4 {
            margin: 0;
            font-size: 15px;
            color: #ffffff;
            font-weight: 600;
        }
        .ss-chat-status {
            font-size: 11px;
            color: #34d399;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .ss-chat-status::before {
            content: '';
            display: inline-block;
            width: 7px;
            height: 7px;
            background: #34d399;
            border-radius: 50%;
            box-shadow: 0 0 6px #34d399;
        }
        .ss-chat-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 18px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: 0.2s;
        }
        .ss-chat-close:hover {
            color: #ff7b00;
            background: rgba(255,255,255,0.08);
        }
        .ss-chat-messages {
            flex: 1;
            padding: 18px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,123,0,0.3) transparent;
        }
        .ss-msg-group {
            display: flex;
            flex-direction: column;
            max-width: 80%;
        }
        .ss-msg-group.me {
            align-self: flex-end;
            align-items: flex-end;
        }
        .ss-msg-group.other {
            align-self: flex-start;
            align-items: flex-start;
        }
        .ss-msg-sender {
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 3px;
            padding: 0 4px;
        }
        .ss-msg-bubble {
            padding: 10px 14px;
            border-radius: 16px;
            font-size: 13px;
            line-height: 1.45;
            word-break: break-word;
        }
        .ss-msg-group.me .ss-msg-bubble {
            background: linear-gradient(135deg, #ff7b00, #ff5500);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 12px rgba(255, 123, 0, 0.25);
        }
        .ss-msg-group.other .ss-msg-bubble {
            background: rgba(255, 255, 255, 0.08);
            color: #f1f5f9;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-bottom-left-radius: 4px;
        }
        .ss-msg-time {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
            margin-top: 3px;
            padding: 0 4px;
        }
        .ss-chat-footer {
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ss-chat-name-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 11px;
            color: #cbd5e1;
        }
        .ss-chat-name-input {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.15);
            color: #ff9900;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 11px;
            outline: none;
            flex: 1;
        }
        .ss-chat-input-row {
            display: flex;
            gap: 8px;
        }
        .ss-chat-input {
            flex: 1;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 10px 16px;
            color: #ffffff;
            font-size: 13px;
            outline: none;
            transition: 0.2s;
        }
        .ss-chat-input:focus {
            border-color: #ff7b00;
            box-shadow: 0 0 10px rgba(255,123,0,0.3);
        }
        .ss-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff7b00, #ff5500);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s;
            box-shadow: 0 4px 12px rgba(255,123,0,0.3);
        }
        .ss-chat-send:hover {
            transform: scale(1.08);
        }
        @media(max-width: 480px){
            .ss-chat-window {
                right: -10px;
                width: 95vw;
                height: 75vh;
            }
            .ss-chat-toggle span.label {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);

    // Get current user name
    let currentUser = "Donor";
    try {
        const stored = localStorage.getItem("sevasetu_current_user");
        if(stored){
            const parsed = JSON.parse(stored);
            if(parsed.name) currentUser = parsed.name;
        }
    } catch(e){}

    // Build DOM
    const root = document.createElement('div');
    root.id = 'sevasetu-chat-root';
    root.innerHTML = `
        <div class="ss-chat-window" id="ssChatWindow">
            <div class="ss-chat-header">
                <div class="ss-chat-title">
                    <div class="ss-chat-avatar"><i class="fa-solid fa-hands-holding-child"></i></div>
                    <div class="ss-chat-info">
                        <h4>SevaSetu Community</h4>
                        <div class="ss-chat-status">Live Connected</div>
                    </div>
                </div>
                <button class="ss-chat-close" id="ssChatClose"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="ss-chat-messages" id="ssChatMessages">
                <!-- Messages populated dynamically -->
            </div>

            <div class="ss-chat-footer">
                <div class="ss-chat-name-row">
                    <span>Chatting as:</span>
                    <input type="text" id="ssSenderInput" class="ss-chat-name-input" value="${currentUser}" placeholder="Your Name">
                </div>
                <div class="ss-chat-input-row">
                    <input type="text" id="ssChatInput" class="ss-chat-input" placeholder="Ask questions or say hello..." autocomplete="off">
                    <button class="ss-chat-send" id="ssChatSend"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>

        <div class="ss-chat-toggle" id="ssChatToggle">
            <div class="ss-chat-icon">
                <i class="fa-solid fa-comments"></i>
                <span class="ss-unread-badge" id="ssUnreadBadge">1</span>
            </div>
            <span class="label">Live Ashram Chat</span>
        </div>
    `;
    document.body.appendChild(root);

    // State & Elements
    let isOpen = false;
    let unreadCount = 0;
    const chatWindow = document.getElementById('ssChatWindow');
    const chatToggle = document.getElementById('ssChatToggle');
    const chatClose = document.getElementById('ssChatClose');
    const chatMessages = document.getElementById('ssChatMessages');
    const chatInput = document.getElementById('ssChatInput');
    const senderInput = document.getElementById('ssSenderInput');
    const chatSend = document.getElementById('ssChatSend');
    const unreadBadge = document.getElementById('ssUnreadBadge');

    function toggleChat(openState){
        isOpen = (openState !== undefined) ? openState : !isOpen;
        if(isOpen){
            chatWindow.classList.add('open');
            unreadCount = 0;
            unreadBadge.style.display = 'none';
            chatInput.focus();
            scrollToBottom();
        } else {
            chatWindow.classList.remove('open');
        }
    }

    chatToggle.addEventListener('click', () => toggleChat());
    chatClose.addEventListener('click', () => toggleChat(false));

    function formatTime(isoOrString){
        if(!isoOrString) return 'Just now';
        try {
            const d = new Date(isoOrString);
            if(isNaN(d.getTime())) return isoOrString;
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch(e){
            return 'Just now';
        }
    }

    function appendMessage(msg, isMe){
        const group = document.createElement('div');
        group.className = `ss-msg-group ${isMe ? 'me' : 'other'}`;
        group.innerHTML = `
            <span class="ss-msg-sender">${isMe ? 'You' : (msg.sender_name || 'Supporter')}</span>
            <div class="ss-msg-bubble">${escapeHtml(msg.message)}</div>
            <span class="ss-msg-time">${formatTime(msg.created_at)}</span>
        `;
        chatMessages.appendChild(group);
        scrollToBottom();

        if(!isOpen && !isMe){
            unreadCount++;
            unreadBadge.innerText = unreadCount;
            unreadBadge.style.display = 'inline-block';
        }
    }

    function scrollToBottom(){
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }

    function escapeHtml(text){
        if(!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function loadInitialMessages(){
        const apiBase = window.API_BASE || (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000');
        let messages = [];
        try {
            const res = await fetch(`${apiBase}/api/chat/messages`);
            if(res.ok){
                const data = await res.json();
                if(data.success && Array.isArray(data.messages)){
                    messages = data.messages;
                }
            }
        } catch(e){
            console.log("Chat offline fallback");
        }

        if(messages.length === 0){
            messages = [
                {
                    id: '1',
                    sender_name: 'SevaSetu Care Bot',
                    message: 'Namaste! Welcome to SevaSetu. You can ask queries about donation distribution, tax receipts, or directly coordinate with our ashrams here.',
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    sender_name: 'Sunrise Orphanage Coordinator',
                    message: 'Warm greetings from Sunrise Orphanage! We are currently running our winter clothes drive. Thank you to everyone donating!',
                    created_at: new Date().toISOString()
                }
            ];
        }

        chatMessages.innerHTML = '';
        const myName = (senderInput.value || '').trim().toLowerCase();
        messages.forEach(m => {
            const isMe = (m.sender_name || '').trim().toLowerCase() === myName && myName !== '';
            appendMessage(m, isMe);
        });
    }

    // Send Message function
    function sendMessage(){
        const text = chatInput.value.trim();
        const sender = senderInput.value.trim() || 'Supporter';
        if(!text) return;

        const payload = {
            sender_name: sender,
            sender_role: 'donor',
            message: text,
            created_at: new Date().toISOString()
        };

        // Emit through socket if available
        if(window.SevaSetuSocket && window.SevaSetuSocket.connected){
            window.SevaSetuSocket.emit('send_chat_message', payload);
        } else {
            // Local fallback
            appendMessage(payload, true);
        }

        chatInput.value = '';
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage();
        }
    });

    // Listen to real-time events from Socket.io
    function setupSocketListener(){
        if(window.SevaSetuSocket){
            window.SevaSetuSocket.on('receive_chat_message', (msg) => {
                const myName = (senderInput.value || '').trim().toLowerCase();
                const isMe = (msg.sender_name || '').trim().toLowerCase() === myName && myName !== '';
                // Don't duplicate if already appended
                appendMessage(msg, isMe);
            });
        } else {
            // Retry connecting to socket after a short moment if socket.io is still loading
            setTimeout(setupSocketListener, 1000);
        }
    }

    // Init
    loadInitialMessages();
    setupSocketListener();

    window.openSevaSetuChat = () => toggleChat(true);
})();
