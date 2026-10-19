/**
 * SevaSetu AI SevaMitra & Real-Time Community Chat Widget
 * Powered by Google Gemini AI (Multilingual Assistant & Need Matchmaker) + WebSockets
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
            background: linear-gradient(135deg, #ff7b00, #ff4500);
            color: #ffffff;
            padding: 12px 22px;
            border-radius: 50px;
            border: 2px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 30px rgba(255, 123, 0, 0.55);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-weight: 600;
            font-size: 14px;
            user-select: none;
            animation: ssGlowPulse 3s infinite;
        }
        @keyframes ssGlowPulse {
            0%, 100% { box-shadow: 0 8px 25px rgba(255, 123, 0, 0.45); }
            50% { box-shadow: 0 10px 35px rgba(255, 123, 0, 0.85); transform: translateY(-2px); }
        }
        .ss-chat-toggle:hover {
            transform: scale(1.05) translateY(-3px);
            box-shadow: 0 14px 35px rgba(255, 123, 0, 0.75);
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
            width: 400px;
            max-width: 92vw;
            height: 560px;
            max-height: 82vh;
            background: rgba(1, 18, 50, 0.97);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 123, 0, 0.4);
            border-radius: 22px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75);
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
            padding: 14px 18px;
            background: linear-gradient(135deg, rgba(255, 123, 0, 0.25), rgba(1, 18, 50, 0.9));
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
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff7b00, #ffaa00);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #011232;
            font-size: 18px;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(255,123,0,0.4);
        }
        .ss-chat-info h4 {
            margin: 0;
            font-size: 15px;
            color: #ffffff;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ss-ai-pill {
            background: linear-gradient(135deg, #ff7b00, #ff4500);
            color: #fff;
            font-size: 9px;
            padding: 2px 7px;
            border-radius: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .ss-chat-status {
            font-size: 11px;
            color: #34d399;
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 1px;
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

        /* TABS (AI SevaMitra vs Community) */
        .ss-tabs-nav {
            display: flex;
            background: rgba(0, 0, 0, 0.35);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding: 4px;
        }
        .ss-tab-btn {
            flex: 1;
            padding: 8px 12px;
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 10px;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .ss-tab-btn.active {
            background: rgba(255, 123, 0, 0.2);
            color: #ff9900;
            border: 1px solid rgba(255, 123, 0, 0.35);
        }
        .ss-tab-btn:hover:not(.active) {
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
        }

        /* CHIPS */
        .ss-chips-container {
            padding: 10px 14px 6px;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: none;
        }
        .ss-chips-container::-webkit-scrollbar {
            display: none;
        }
        .ss-chip {
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 123, 0, 0.3);
            color: #ffd4aa;
            font-size: 11px;
            padding: 5px 10px;
            border-radius: 14px;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .ss-chip:hover {
            background: rgba(255, 123, 0, 0.25);
            color: #ffffff;
            transform: translateY(-1px);
        }

        /* MESSAGES AREA */
        .ss-chat-messages {
            flex: 1;
            padding: 14px 18px;
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
            max-width: 85%;
        }
        .ss-msg-group.me {
            align-self: flex-end;
            align-items: flex-end;
        }
        .ss-msg-group.other, .ss-msg-group.bot {
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
            line-height: 1.5;
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
        .ss-msg-group.bot .ss-msg-bubble {
            background: rgba(12, 28, 46, 0.85);
            color: #f8fafc;
            border: 1px solid rgba(255, 123, 0, 0.3);
            border-bottom-left-radius: 4px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .ss-msg-bubble strong {
            color: #ffb366;
        }
        .ss-msg-time {
            font-size: 10px;
            color: rgba(255,255,255,0.45);
            margin-top: 3px;
            padding: 0 4px;
        }

        /* Typing Dots */
        .ss-typing-dots {
            display: inline-flex;
            gap: 4px;
            padding: 4px 8px;
        }
        .ss-typing-dots span {
            width: 6px;
            height: 6px;
            background: #ff7b00;
            border-radius: 50%;
            animation: ssBounce 1.2s infinite ease-in-out;
        }
        .ss-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ss-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ssBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1.1); opacity: 1; }
        }

        /* Suggestion Buttons inside AI reply */
        .ss-reply-suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
        }
        .ss-reply-sugg-btn {
            background: rgba(255, 123, 0, 0.18);
            border: 1px solid rgba(255, 123, 0, 0.4);
            color: #ffd4aa;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 12px;
            cursor: pointer;
            transition: 0.2s;
        }
        .ss-reply-sugg-btn:hover {
            background: #ff7b00;
            color: #fff;
        }

        /* FOOTER */
        .ss-chat-footer {
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.35);
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
                height: 80vh;
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
        const stored = localStorage.getItem("sevasetu_current_user") || localStorage.getItem("sevasetu_currentUser");
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
                    <div class="ss-chat-avatar" id="ssHeaderAvatar"><i class="fa-solid fa-sparkles"></i></div>
                    <div class="ss-chat-info">
                        <h4 id="ssHeaderTitle">AI SevaMitra <span class="ss-ai-pill">Gemini</span></h4>
                        <div class="ss-chat-status" id="ssHeaderStatus">Multilingual Assistant Active</div>
                    </div>
                </div>
                <button class="ss-chat-close" id="ssChatClose" aria-label="Close Chat"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <!-- TABS -->
            <div class="ss-tabs-nav">
                <button class="ss-tab-btn active" id="ssTabAI" onclick="window.switchSevaSetuTab('ai')">
                    <i class="fa-solid fa-sparkles"></i> 🤖 AI SevaMitra
                </button>
                <button class="ss-tab-btn" id="ssTabCommunity" onclick="window.switchSevaSetuTab('community')">
                    <i class="fa-solid fa-comments"></i> 💬 Ashram Community
                </button>
            </div>

            <!-- QUICK CHIPS (Visible in AI Mode) -->
            <div class="ss-chips-container" id="ssChipsContainer">
                <button class="ss-chip" onclick="window.sendSevaSetuChip('💡 80G Tax Exemption benefit kaise milta hai?')">💡 80G Tax Exemption</button>
                <button class="ss-chip" onclick="window.sendSevaSetuChip('🧒 Find Urgent Needs for Orphanage Children')">🧒 Orphanage Needs</button>
                <button class="ss-chip" onclick="window.sendSevaSetuChip('👵 Old-Age Homes needing medical care')">👵 Old Age Care</button>
                <button class="ss-chip" onclick="window.sendSevaSetuChip('🛡️ Is donation 100% safe & transparent?')">🛡️ Safety & Trust</button>
            </div>

            <!-- MESSAGES CONTAINER -->
            <div class="ss-chat-messages" id="ssChatMessages">
                <!-- Dynamic messages -->
            </div>

            <!-- FOOTER -->
            <div class="ss-chat-footer">
                <div class="ss-chat-name-row" id="ssNameRow" style="display:none;">
                    <span>Chatting as:</span>
                    <input type="text" id="ssSenderInput" class="ss-chat-name-input" value="${currentUser}" placeholder="Your Name">
                </div>
                <div class="ss-chat-input-row">
                    <input type="text" id="ssChatInput" class="ss-chat-input" placeholder="Ask AI SevaMitra in Hindi, English, Hinglish..." autocomplete="off">
                    <button class="ss-chat-send" id="ssChatSend" aria-label="Send Message"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>

        <div class="ss-chat-toggle" id="ssChatToggle">
            <div class="ss-chat-icon">
                <i class="fa-solid fa-sparkles"></i>
                <span class="ss-unread-badge" id="ssUnreadBadge">1</span>
            </div>
            <span class="label">✨ AI SevaMitra</span>
        </div>
    `;
    document.body.appendChild(root);

    // State & Elements
    let isOpen = false;
    let currentTab = 'ai'; // 'ai' or 'community'
    let unreadCount = 0;
    const aiConversationHistory = [];
    const communityMessages = [];

    const chatWindow = document.getElementById('ssChatWindow');
    const chatToggle = document.getElementById('ssChatToggle');
    const chatClose = document.getElementById('ssChatClose');
    const chatMessages = document.getElementById('ssChatMessages');
    const chatInput = document.getElementById('ssChatInput');
    const senderInput = document.getElementById('ssSenderInput');
    const nameRow = document.getElementById('ssNameRow');
    const chatSend = document.getElementById('ssChatSend');
    const unreadBadge = document.getElementById('ssUnreadBadge');
    const chipsContainer = document.getElementById('ssChipsContainer');
    const headerTitle = document.getElementById('ssHeaderTitle');
    const headerStatus = document.getElementById('ssHeaderStatus');
    const headerAvatar = document.getElementById('ssHeaderAvatar');
    const tabAI = document.getElementById('ssTabAI');
    const tabCommunity = document.getElementById('ssTabCommunity');

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

    window.switchSevaSetuTab = function(tab){
        currentTab = tab;
        if(tab === 'ai'){
            tabAI.classList.add('active');
            tabCommunity.classList.remove('active');
            chipsContainer.style.display = 'flex';
            nameRow.style.display = 'none';
            headerTitle.innerHTML = `AI SevaMitra <span class="ss-ai-pill">Gemini</span>`;
            headerStatus.innerText = 'Multilingual Assistant Active';
            headerAvatar.innerHTML = `<i class="fa-solid fa-sparkles"></i>`;
            chatInput.placeholder = "Ask AI SevaMitra in Hindi, English, Hinglish...";
            renderAIMessages();
        } else {
            tabCommunity.classList.add('active');
            tabAI.classList.remove('active');
            chipsContainer.style.display = 'none';
            nameRow.style.display = 'flex';
            headerTitle.innerHTML = `Ashram Community`;
            headerStatus.innerText = 'Live WebSocket Connected';
            headerAvatar.innerHTML = `<i class="fa-solid fa-hands-holding-child"></i>`;
            chatInput.placeholder = "Message ashram coordinators & donors...";
            renderCommunityMessages();
        }
    };

    function formatMarkdown(text){
        if(!text) return '';
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Bold **text**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullets • or *
        escaped = escaped.replace(/^\s*[•*]\s*(.*)$/gm, '<div style="margin-left:8px;display:flex;gap:6px;"><span>•</span><span>$1</span></div>');
        // Newlines
        escaped = escaped.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
        return escaped;
    }

    function appendAIMessage(msg, isUser, suggestions = []){
        const group = document.createElement('div');
        group.className = `ss-msg-group ${isUser ? 'me' : 'bot'}`;
        
        let suggHtml = '';
        if(!isUser && Array.isArray(suggestions) && suggestions.length > 0){
            suggHtml = `<div class="ss-reply-suggestions">
                ${suggestions.map(s => `<button class="ss-reply-sugg-btn" onclick="window.sendSevaSetuChip('${escapeHtml(s)}')">${escapeHtml(s)}</button>`).join('')}
            </div>`;
        }

        group.innerHTML = `
            <span class="ss-msg-sender">${isUser ? 'You' : '🤖 SevaMitra AI'}</span>
            <div class="ss-msg-bubble">${formatMarkdown(msg)}</div>
            ${suggHtml}
            <span class="ss-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        chatMessages.appendChild(group);
        scrollToBottom();
    }

    function renderAIMessages(){
        chatMessages.innerHTML = '';
        if(aiConversationHistory.length === 0){
            appendAIMessage(
                `Namaste! 🙏 I am **AI SevaMitra**, your intelligent guide powered by **Google Gemini**.\n\nI can help you with:\n• Finding verified orphanages & old age homes across India\n• **Section 80G Tax Exemption** (50% deduction details)\n• Matching your donation budget with urgent active needs\n• Volunteering and offline ashram visit guidelines\n\nHow may I assist you today?`,
                false,
                ["💡 80G Tax Exemption", "🧒 Orphanage Needs", "👵 Old Age Homes", "Find Urgent Needs"]
            );
        } else {
            aiConversationHistory.forEach(item => {
                appendAIMessage(item.text, item.sender === 'user', item.suggestions || []);
            });
        }
    }

    function renderCommunityMessages(){
        chatMessages.innerHTML = '';
        const myName = (senderInput.value || '').trim().toLowerCase();
        communityMessages.forEach(m => {
            const isMe = (m.sender_name || '').trim().toLowerCase() === myName && myName !== '';
            appendCommunityMessage(m, isMe);
        });
        if(communityMessages.length === 0){
            loadInitialCommunityMessages();
        }
    }

    function appendCommunityMessage(msg, isMe){
        const group = document.createElement('div');
        group.className = `ss-msg-group ${isMe ? 'me' : 'other'}`;
        group.innerHTML = `
            <span class="ss-msg-sender">${isMe ? 'You' : (msg.sender_name || 'Supporter')}</span>
            <div class="ss-msg-bubble">${escapeHtml(msg.message)}</div>
            <span class="ss-msg-time">${msg.created_at ? formatTime(msg.created_at) : 'Just now'}</span>
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
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

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

    window.sendSevaSetuChip = function(query){
        chatInput.value = query;
        handleSendMessage();
    };

    // Main Send Message Handler
    async function handleSendMessage(){
        const text = chatInput.value.trim();
        if(!text) return;
        chatInput.value = '';

        if(currentTab === 'ai'){
            // User message in AI
            appendAIMessage(text, true);
            aiConversationHistory.push({ sender: 'user', text });

            // Typing indicator
            const typingGroup = document.createElement('div');
            typingGroup.className = 'ss-msg-group bot';
            typingGroup.id = 'ssTypingIndicator';
            typingGroup.innerHTML = `
                <span class="ss-msg-sender">🤖 SevaMitra AI</span>
                <div class="ss-msg-bubble"><div class="ss-typing-dots"><span></span><span></span><span></span></div> Thinking...</div>
            `;
            chatMessages.appendChild(typingGroup);
            scrollToBottom();

            // Call API
            const apiBase = window.API_BASE || (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000');
            try {
                let aiResponse = null;
                if(window.SevaSetuAPI && window.SevaSetuAPI.aiChat){
                    aiResponse = await window.SevaSetuAPI.aiChat(text, aiConversationHistory);
                } else {
                    const res = await fetch(`${apiBase}/api/ai/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text, conversationHistory: aiConversationHistory })
                    });
                    aiResponse = await res.json();
                }

                const indicator = document.getElementById('ssTypingIndicator');
                if(indicator) indicator.remove();

                const reply = aiResponse.reply || "Namaste! I am here to help you support verified care homes.";
                const suggestions = aiResponse.suggestions || [];
                appendAIMessage(reply, false, suggestions);
                aiConversationHistory.push({ sender: 'bot', text: reply, suggestions });

            } catch(e){
                const indicator = document.getElementById('ssTypingIndicator');
                if(indicator) indicator.remove();
                appendAIMessage("Namaste! We are currently experiencing a brief network pause. Our verified listings remain fully accessible in the directory.", false, ["View Care Homes", "80G Tax Exemption"]);
            }

        } else {
            // Community WebSocket Message
            const sender = senderInput.value.trim() || 'Supporter';
            const payload = {
                sender_name: sender,
                sender_role: 'donor',
                message: text,
                created_at: new Date().toISOString()
            };

            if(window.SevaSetuSocket && window.SevaSetuSocket.connected){
                window.SevaSetuSocket.emit('send_chat_message', payload);
            } else {
                communityMessages.push(payload);
                appendCommunityMessage(payload, true);
            }
        }
    }

    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            handleSendMessage();
        }
    });

    async function loadInitialCommunityMessages(){
        const apiBase = window.API_BASE || (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(`${apiBase}/api/chat/messages`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if(res.ok){
                const data = await res.json();
                if(data.success && Array.isArray(data.messages)){
                    communityMessages.length = 0;
                    data.messages.forEach(m => communityMessages.push(m));
                    renderCommunityMessages();
                    return;
                }
            }
        } catch(e){}

        communityMessages.length = 0;
        communityMessages.push(
            { id: '1', sender_name: 'SevaSetu Team', message: 'Namaste! Welcome to our Community Ashram chat.', created_at: new Date().toISOString() },
            { id: '2', sender_name: 'Sunrise Orphanage Coordinator', message: 'Warm greetings from Sunrise Orphanage! Thank you to everyone supporting our children.', created_at: new Date().toISOString() }
        );
        renderCommunityMessages();
    }

    function setupSocketListener(){
        if(window.SevaSetuSocket){
            window.SevaSetuSocket.on('receive_chat_message', (msg) => {
                communityMessages.push(msg);
                if(currentTab === 'community'){
                    const myName = (senderInput.value || '').trim().toLowerCase();
                    const isMe = (msg.sender_name || '').trim().toLowerCase() === myName && myName !== '';
                    appendCommunityMessage(msg, isMe);
                } else if(!isOpen){
                    unreadCount++;
                    unreadBadge.innerText = unreadCount;
                    unreadBadge.style.display = 'inline-block';
                }
            });
        } else {
            setTimeout(setupSocketListener, 1000);
        }
    }

    // Init AI Tab first
    renderAIMessages();
    setupSocketListener();

    window.openSevaSetuChat = () => toggleChat(true);
})();
