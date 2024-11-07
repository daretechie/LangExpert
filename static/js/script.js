const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend server

const chatWindow = document.getElementById('chat-window');
const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const languageSelect = document.getElementById('language-select');
const speakButton = document.getElementById('speak-button');

let selectedLanguage = '';
let sourceLanguage = 'en'; // Default source language

// Fetch available languages from backend
window.addEventListener('DOMContentLoaded', () => {
    fetchLanguages();
});

// Function to fetch languages and populate the dropdown
function fetchLanguages() {
    fetch(`${API_BASE_URL}/api/languages`)
        .then(response => response.json())
        .then(languages => {
            if (languages.error) {
                addAIMessage(`Error fetching languages: ${languages.error}`);
                return;
            }
            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.text = lang.name;
                languageSelect.appendChild(option);
            });
        })
        .catch(error => {
            addAIMessage(`Error fetching languages: ${error.message}`);
            console.error("Error fetching languages:", error);
        });
}

// Handle language selection
languageSelect.addEventListener('change', () => {
    selectedLanguage = languageSelect.value;
    const languageName = languageSelect.options[languageSelect.selectedIndex].text;
    addAIMessage(`Great choice! Let's start learning ${languageName}.`);
});

// Send message
sendButton.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text && selectedLanguage) {
        addUserMessage(text);
        userInput.value = '';
        fetchTranslation(text, selectedLanguage);
    } else if (!selectedLanguage) {
        addAIMessage("Please select a language first.");
    }
});

// Enter key sends message
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

// Speech recognition
speakButton.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Sorry, your browser doesn't support speech recognition.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = sourceLanguage;
    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendButton.click();
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event.error);
    };
});

// Add user message to chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user');
    messageDiv.innerText = `👤 ${message}`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Add AI message to chat with read button
function addAIMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai');
    messageDiv.innerHTML = `🤖 ${message} <button class="read-button" onclick="readAloud('${escapeText(message)}')">🔊</button>`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    speakText(message);
}

// Fetch translation and respond
function fetchTranslation(text, targetLang) {
    fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: targetLang })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            addAIMessage(`Error: ${data.error}`);
            return;
        }
        const translatedText = data.translatedText;
        addAIMessage(translatedText);
    })
    .catch(error => {
        addAIMessage(`Error: ${error.message}`);
        console.error("Error fetching translation:", error);
    });
}

// Text-to-speech
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLang(selectedLanguage) || 'en-US';
    window.speechSynthesis.speak(utterance);
}

// Read aloud when read button is clicked
function readAloud(text) {
    speakText(text);
}

// Utility function to escape text for HTML
function escapeText(text) {
    return text.replace(/'/g, "\\'");
}

// Utility function to map language codes to speech synthesis language tags
function getSpeechLang(langCode) {
    const langMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'tr': 'tr-TR',
        'nl': 'nl-NL',
        'pl': 'pl-PL',
        'vi': 'vi-VN',
        'th': 'th-TH',
        'sv': 'sv-SE',
        'da': 'da-DK',
        'fi': 'fi-FI'
    };
    return langMap[langCode];
}