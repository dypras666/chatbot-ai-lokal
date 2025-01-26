const API_URL = 'http://localhost:1234';
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html");
editor.setFontSize(14);

// Core variables
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const modelSelect = document.getElementById('modelSelect');
const htmlTab = document.getElementById('htmlTab');
const jsTab = document.getElementById('jsTab');
const preview = document.getElementById('preview');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
let currentController = null;
let currentMode = 'html';
let referenceData = {};
let referenceDataMasak = {};

// Load reference data
async function loadReferenceData() {
    try {
        const [produktResponse, masakResponse] = await Promise.all([
            fetch('produk.json'),
            fetch('masak.json')
        ]);

        referenceData = await produktResponse.json();
        referenceDataMasak = await masakResponse.json();
    } catch (error) {
        console.error('Error loading reference data:', error);
    }
}

async function loadModels() {
    try {
        const response = await axios.get(`${API_URL}/v1/models`);
        modelSelect.innerHTML = response.data.data
            .map(model => `<option value="${model.id}">${model.id}</option>`)
            .join('');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

function showCodePanel() {
    document.getElementById('codePanel').classList.remove('hidden');
    document.getElementById('mainContainer').classList.remove('grid-cols-[1fr]');
    document.getElementById('mainContainer').classList.add('grid-cols-[1fr,1fr]');
    document.querySelector('.fixed.bottom-0.left-0').classList.remove('w-full');
    document.querySelector('.fixed.bottom-0.left-0').classList.add('w-1/2');
}

function hideCodePanel() {
    document.getElementById('codePanel').classList.add('hidden');
    document.getElementById('mainContainer').classList.remove('grid-cols-[1fr,1fr]');
    document.getElementById('mainContainer').classList.add('grid-cols-[1fr]');
    document.querySelector('.fixed.bottom-0.left-0').classList.remove('w-1/2');
    document.querySelector('.fixed.bottom-0.left-0').classList.add('w-full');
}

function setMode(mode) {
    currentMode = mode;
    if (mode === 'html') {
        htmlTab.className = 'px-4 py-2 bg-blue-600 rounded hover:bg-blue-700';
        jsTab.className = 'px-4 py-2 bg-gray-700 rounded hover:bg-gray-600';
        editor.session.setMode("ace/mode/html");
    } else {
        htmlTab.className = 'px-4 py-2 bg-gray-700 rounded hover:bg-gray-600';
        jsTab.className = 'px-4 py-2 bg-blue-600 rounded hover:bg-blue-700';
        editor.session.setMode("ace/mode/javascript");
    }
}

function runCode() {
    const code = editor.getValue();
    if (currentMode === 'html') {
        preview.srcdoc = code;
    } else {
        preview.srcdoc = `<script>${code}<\/script>`;
    }
}

function addMessage(content, isUser = false, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-5 mb-4 rounded-2xl message-animation message-bubble ${
        isUser ? 'bg-blue-600/20 ml-12' : 'bg-gray-800/20 mr-12'
    }`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'flex gap-4 items-start';
    
    const avatar = document.createElement('div');
    avatar.className = `w-10 h-10 rounded-xl flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-indigo-600'
    } shadow-lg`;
    avatar.innerHTML = `<i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-lg"></i>`;
    
    const textContent = document.createElement('div');
    textContent.className = 'flex-1 leading-relaxed';
    
    if (isLoading) {
        const loader = document.createElement('div');
        loader.className = 'message-loader';
        textContent.appendChild(loader);
    } else {
        textContent.innerHTML = isUser ? content : marked.parse(content);
    }
    
    messageContent.appendChild(avatar);
    messageContent.appendChild(textContent);
    messageDiv.appendChild(messageContent);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return messageDiv;
}

function processStreamContent(streamContent) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [...streamContent.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
        showCodePanel();
        const match = matches[matches.length - 1];
        const language = match[1] || '';
        const code = match[2];
        
        if (language === 'html' || language === 'javascript' || language === 'js') {
            editor.setValue(code, -1);
            setMode(language === 'html' ? 'html' : 'js');
            runCode();
        }
    } else {
        hideCodePanel();
    }
    return marked.parse(streamContent, { breaks: true, gfm: true });
}
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    const loadingMessage = addMessage('', false, true);
    
    userInput.value = '';
    userInput.style.height = 'auto';
    setLoadingState(true);
    currentController = new AbortController();

    try {
        const response = await fetch(`${API_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: modelSelect.value,
                messages: [
                    {
                        role: 'system',
                        content: `
Anda adalah AI dengan nama TUMBAL BOT, yang HARUS selalu berkomunikasi dalam Bahasa Indonesia   formal.
Instruksi wajib: 
1. SELALU gunakan Bahasa Indonesia formal
2. JANGAN PERNAH menggunakan bahasa lain
3. Jika user bertanya dalam bahasa lain, tetap jawab dalam Bahasa Indonesia 
4. Kamu bisa koding apapun dan menggenerate kode nya langsung
 
Data resep: ${JSON.stringify(referenceDataMasak)}
 
Perintah Memasak:
- "resep [nama makanan]": Tampilkan instruksi memasak
- "cari resep [tag]": Cari resep berdasarkan tag
- "masakan [cuisine]": Tampilkan resep berdasarkan jenis masakan
- "nutrisi [nama makanan]": Informasi kalori dan nutrisi`
                    },
                    { role: 'user', content: message }
                ],
                stream: true,
                temperature: 0.7
            }),
            signal: currentController.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamContent = '';

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
                
                try {
                    const content = JSON.parse(line.slice(6)).choices[0]?.delta?.content || '';
                    streamContent += content;
                    
                    const htmlContent = processStreamContent(streamContent);
                    loadingMessage.querySelector('.flex-1').innerHTML = htmlContent;
                } catch (e) {
                    console.error('Error parsing stream:', e);
                }
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            loadingMessage.remove();
            addMessage('Pesan dibatalkan');
        } else {    
            loadingMessage.remove();
            addMessage('Error: Tidak dapat mendapatkan respons dari server.');
            console.error('Error:', error);
        }
    } finally {
        currentController = null;
        setLoadingState(false);
        sendButton.disabled = false;
    }
}

function setLoadingState(isLoading) {
    const spinner = sendButton.querySelector('.loading-spinner');
    const stopIcon = sendButton.querySelector('.fa-stop');
    const sendIcon = sendButton.querySelector('.fa-paper-plane');
    
    if (isLoading) {
        spinner.classList.remove('hidden');
        stopIcon.classList.remove('hidden');
        sendIcon.classList.add('hidden');
        sendButton.classList.add('bg-gray-700/30');
    } else {
        spinner.classList.add('hidden');
        stopIcon.classList.add('hidden');
        sendIcon.classList.remove('hidden');
        sendButton.classList.remove('bg-gray-700/30');
    }
}

// Event Listeners
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    sendButton.disabled = !this.value.trim();
});

sendButton.addEventListener('click', () => {
    if (currentController) {
        currentController.abort();
        currentController = null;
        setLoadingState(false);
        return;
    }
    sendMessage();
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

htmlTab.addEventListener('click', () => setMode('html'));
jsTab.addEventListener('click', () => setMode('js'));
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', () => {
    editor.setValue('');
    preview.srcdoc = '';
});

document.querySelector('button:not(#sidebarToggle)').addEventListener('click', () => {
    chatContainer.innerHTML = '';
    editor.setValue('');
    preview.srcdoc = '';
});

// Initialize
loadReferenceData();
loadModels();