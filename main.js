import {
    sounds
} from './sounds.js';
let allowOverlap = false;
let showFavorites = false;
let currentAudios = [];
const toggleButton = document.getElementById('toggleButton');
const stopButton = document.getElementById('stopButton');
const searchInput = document.getElementById('searchInput');
const favoriteButton = document.getElementById('toggleFavorites')
const soundBoard = document.getElementById('soundboard');
toggleButton.onclick = () => {
    allowOverlap = !allowOverlap;
    toggleButton.textContent = allowOverlap ? '🔊 Overlap: ON' : '🔇 Overlap: OFF';
};
stopButton.onclick = () => {
    currentAudios.forEach(a => a.pause());
    currentAudios = [];
};
favoriteButton.onclick = () => {
    showFavorites = !showFavorites;
    favoriteButton.textContent = showFavorites ? '🌟 Favorites: ON' : '⭐ Favorites: OFF';
    renderSounds(showFavorites ? "filter:favorite "+searchInput.value : searchInput.value);
}

function renderSounds(filter = '') {
    soundBoard.innerHTML = '';
    let finalSound;
    if (filter.startsWith("filter:favorite ")) {
        finalSound = (localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [])
            .filter(s => s.name.toLowerCase().includes(filter.toLowerCase().replace('filter:favorite ', '')));
    } else {
        finalSound = sounds.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
    }
    finalSound.forEach(sound => {
        const wrapper = document.createElement('div');
        wrapper.className = 'sound-wrapper';
        const button = document.createElement('button');
        wrapper.addEventListener("contextmenu", (e) => {
            rightClickPanel(e, wrapper, sound);
        });        
        button.className = 'sound-button-img';
        button.style.setProperty('--btn-color', sound.color);
        const image = document.createElement('div');
        image.className = 'sound-image';
        button.appendChild(image);
        button.onclick = () => {
            if (!allowOverlap) {
                currentAudios.forEach(a => a.pause());
                currentAudios = [];
            }
            const audio = new Audio("https://cdn.jsdelivr.net/gh/jmata991/soundboard@main/"+sound.mp3);
            audio.play();
            currentAudios.push(audio);
            image.classList.add('pressed');
            setTimeout(() => image.classList.remove('pressed'), 150);
        };
        const label = document.createElement('div');
        label.className = 'sound-label';
        label.textContent = sound.name;
        wrapper.appendChild(button);
        wrapper.appendChild(label);
        soundBoard.appendChild(wrapper);
    });
}
renderSounds();
searchInput.addEventListener('input', () => {
    renderSounds((showFavorites? "filter:favorite ": "")+searchInput.value);
});
const addSoundButton = document.getElementById('addSoundButton');
const soundUpload = document.getElementById('soundUpload');

// Trigger the hidden file input when the button is clicked
addSoundButton.onclick = () => soundUpload.click();

soundUpload.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const customSound = {
            name: file.name.split('.')[0], // Use filename as the name
            mp3: e.target.result,         // Store the actual audio data string
            color: '#4CAF50',             // Default green for custom sounds
            isCustom: true                // Flag to identify custom sounds
        };

        // Save to a "customSounds" list in localStorage
        let customSounds = localStorage.getItem('customSounds') ? JSON.parse(localStorage.getItem('customSounds')) : [];
        customSounds.push(customSound);
        localStorage.setItem('customSounds', JSON.stringify(customSounds));

        // Refresh the board
        renderSounds(searchInput.value);
    };
    reader.readAsDataURL(file); // Convert file to string for storage
};
function renderSounds(filter = '') {
    soundBoard.innerHTML = '';
    
    // 1. Get the original sounds
    let originalSounds = sounds;
    
    // 2. Get custom sounds from localStorage
    let customSounds = localStorage.getItem('customSounds') ? JSON.parse(localStorage.getItem('customSounds')) : [];
    
    // 3. Combine them
    let allSounds = [...originalSounds, ...customSounds];

    let finalSounds;
    if (filter.startsWith("filter:favorite ")) {
        const searchTerms = filter.replace('filter:favorite ', '').toLowerCase();
        finalSounds = (localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [])
            .filter(s => s.name.toLowerCase().includes(searchTerms));
    } else {
        finalSounds = allSounds.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
    }

    finalSounds.forEach(sound => {
        // ... (keep your existing button creation logic) ...
        
        button.onclick = () => {
            if (!allowOverlap) {
                currentAudios.forEach(a => a.pause());
                currentAudios = [];
            }
            
            // Check if it's a custom sound (already a Data URL) or a hosted file
            const audioSrc = sound.isCustom ? sound.mp3 : "https://cdn.jsdelivr.net" + sound.mp3;
            
            const audio = new Audio(audioSrc);
            audio.play();
            currentAudios.push(audio);
            image.classList.add('pressed');
            setTimeout(() => image.classList.remove('pressed'), 150);
        };
        
        // ... (rest of your wrapper/label logic) ...
    });
}
// ... existing favorite and download buttons ...

// Add Delete Button (Only for Custom Sounds)
if (sound.isCustom) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'right-click-panel-button';
    deleteBtn.style.color = '#ff4444'; // Red to indicate deletion
    deleteBtn.textContent = '🗑️ Delete Sound';

    deleteBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete "${sound.name}"?`)) {
            // 1. Get current custom sounds
            let customSounds = JSON.parse(localStorage.getItem('customSounds') || '[]');
            
            // 2. Filter out the current sound
            customSounds = customSounds.filter(s => s.name !== sound.name || s.mp3 !== sound.mp3);
            
            // 3. Save back to localStorage
            localStorage.setItem('customSounds', JSON.stringify(customSounds));
            
            // 4. Remove from Favorites if it was there
            let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            favorites = favorites.filter(s => s.name !== sound.name);
            localStorage.setItem('favorites', JSON.stringify(favorites));

            panel.remove();
            renderSounds(searchInput.value); // Refresh the UI
        }
    };
    panel.appendChild(deleteBtn);
}
function exportCustomSounds() {
    const data = localStorage.getItem('customSounds');
    const blob = new Blob([`export const customSounds = ${data};`], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customsounds.js';
    a.click();
}


function rightClickPanel(event, button, sound) {
    document.querySelectorAll('.right-click-panel').forEach(p => p.remove());

    const panel = document.createElement('div');
    panel.className = 'right-click-panel';
    panel.style.setProperty('--btn-color', button.style.getPropertyValue('--btn-color'));
    panel.style.position = 'absolute';
    panel.style.left = `${event.pageX}px`;
    panel.style.top = `${event.pageY}px`;

    // favorite button
    let favoriteJson = localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [];
    const favorite = document.createElement('button');
    favorite.className = 'right-click-panel-button';
    const isFavorite = favoriteJson.some(item => item.name === sound.name);
    favorite.textContent = isFavorite ? '⭐ Unfavorite' : "🌟 Favorite";

    favorite.onclick = () => {
        const isFavorite = favoriteJson.some(item => item.name === sound.name);
        if (isFavorite) {
            favoriteJson = favoriteJson.filter(item => item.name !== sound.name);
            if (showFavorites) {
                renderSounds("filter:favorite "+searchInput.value);
            }
        } else {
            favoriteJson.push(sound);
        }
        localStorage.setItem("favorites", JSON.stringify(favoriteJson));
        panel.remove();
    };
    
    // download button
    const download = document.createElement('button');
    download.className = 'right-click-panel-button';
    download.textContent = '💾 Download';
    
    download.onclick = () => {
        const link = document.createElement('a');
        link.href = 'https://cdn.jsdelivr.net/gh/jmata991/soundboard@main/'+sound.mp3;
        link.download = sound.mp3.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    panel.appendChild(favorite);
    panel.appendChild(download);
    document.body.appendChild(panel);

    event.preventDefault();

    setTimeout(() => {
        const handleOutsideClick = (e) => {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', handleOutsideClick);
            }
        };
        document.addEventListener('click', handleOutsideClick);
    }, 0);
}

// tts

const ttsToggle     = document.getElementById('ttsToggle');
const ttsPanel      = document.getElementById('ttsPanel');
const ttsClose      = document.getElementById('ttsClose');
const ttsText       = document.getElementById('ttsText');
const ttsVoice      = document.getElementById('ttsVoice');
const ttsLangFilter = document.getElementById('ttsLangFilter');
const ttsVolume     = document.getElementById('ttsVolume');
const ttsRate       = document.getElementById('ttsRate');
const ttsPitch      = document.getElementById('ttsPitch');
const ttsVolumeVal  = document.getElementById('ttsVolumeVal');
const ttsRateVal    = document.getElementById('ttsRateVal');
const ttsPitchVal   = document.getElementById('ttsPitchVal');
const ttsSpeak      = document.getElementById('ttsSpeak');
const ttsPauseBtn   = document.getElementById('ttsPause');
const ttsResumeBtn  = document.getElementById('ttsResume');
const ttsStopBtn    = document.getElementById('ttsStop');
const ttsResetBtn   = document.getElementById('ttsReset');
const ttsStatus     = document.getElementById('ttsStatus');
const ttsSpeaking   = document.getElementById('ttsSpeaking');
const ttsCurrentWord = document.getElementById('ttsCurrentWord');

const synth = window.speechSynthesis;
let allVoices = [];
let currentUtterance = null;

ttsToggle.onclick = () => {
    ttsPanel.classList.toggle('hidden');
    ttsToggle.classList.toggle('tts-toggle-active');
};
ttsClose.onclick = () => {
    ttsPanel.classList.add('hidden');
    ttsToggle.classList.remove('tts-toggle-active');
};

function loadVoices() {
    allVoices = synth.getVoices();
    if (!allVoices.length) return;

    const langs = [...new Set(allVoices.map(v => v.lang))].sort();
    ttsLangFilter.innerHTML = '<option value="">All Languages</option>';
    langs.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang;
        opt.textContent = lang;
        ttsLangFilter.appendChild(opt);
    });

    populateVoiceList('');
}

function populateVoiceList(langFilter) {
    const filtered = langFilter
        ? allVoices.filter(v => v.lang === langFilter)
        : allVoices;

    ttsVoice.innerHTML = '';
    filtered.forEach((voice, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.dataset.voiceName = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' ★' : ''}`;
        ttsVoice.appendChild(opt);
    });

    const defIdx = filtered.findIndex(v => v.default);
    if (defIdx >= 0) ttsVoice.selectedIndex = defIdx;
}

function getSelectedVoice() {
    const langFilter = ttsLangFilter.value;
    const filtered   = langFilter ? allVoices.filter(v => v.lang === langFilter) : allVoices;
    return filtered[ttsVoice.selectedIndex] || null;
}

loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

ttsLangFilter.addEventListener('change', () => {
    populateVoiceList(ttsLangFilter.value);
});

ttsVolume.addEventListener('input', () => { ttsVolumeVal.textContent = parseFloat(ttsVolume.value).toFixed(2); });
ttsRate.addEventListener('input',   () => { ttsRateVal.textContent   = parseFloat(ttsRate.value).toFixed(1); });
ttsPitch.addEventListener('input',  () => { ttsPitchVal.textContent  = parseFloat(ttsPitch.value).toFixed(2); });

ttsSpeak.onclick = () => {
    const text = ttsText.value.trim();
    if (!text) {
        setStatus('⚠️ Please enter some text first.', 'warn');
        return;
    }
    synth.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.voice  = getSelectedVoice();
    currentUtterance.volume = parseFloat(ttsVolume.value);
    currentUtterance.rate   = parseFloat(ttsRate.value);
    currentUtterance.pitch  = parseFloat(ttsPitch.value);

    currentUtterance.onstart = () => {
        setStatus('🔊 Speaking…', 'speaking');
        setBtns(true);
        ttsSpeaking.classList.remove('hidden');
    };

    currentUtterance.onboundary = (e) => {
        if (e.name === 'word') {
            const word = text.substr(e.charIndex, e.charLength);
            ttsCurrentWord.textContent = word;
            ttsCurrentWord.classList.remove('word-pop');
            void ttsCurrentWord.offsetWidth; // reflow
            ttsCurrentWord.classList.add('word-pop');
        }
    };

    currentUtterance.onpause = () => {
        setStatus('⏸ Paused', 'paused');
    };

    currentUtterance.onresume = () => {
        setStatus('🔊 Resumed…', 'speaking');
    };

    currentUtterance.onend = () => {
        setStatus('✅ Done', 'done');
        setBtns(false);
        ttsSpeaking.classList.add('hidden');
        ttsCurrentWord.textContent = '';
    };

    currentUtterance.onerror = (e) => {
        setStatus(`❌ Error: ${e.error}`, 'error');
        setBtns(false);
        ttsSpeaking.classList.add('hidden');
    };

    synth.speak(currentUtterance);
};

ttsPauseBtn.onclick = () => {
    if (synth.speaking && !synth.paused) synth.pause();
    ttsPauseBtn.disabled  = true;
    ttsResumeBtn.disabled = false;
};

ttsResumeBtn.onclick = () => {
    if (synth.paused) synth.resume();
    ttsPauseBtn.disabled  = false;
    ttsResumeBtn.disabled = true;
};

ttsStopBtn.onclick = () => {
    synth.cancel();
    setBtns(false);
    ttsSpeaking.classList.add('hidden');
    ttsCurrentWord.textContent = '';
    setStatus('⏹ Stopped', 'idle');
};

ttsResetBtn.onclick = () => {
    ttsVolume.value = 1;   ttsVolumeVal.textContent = '1.00';
    ttsRate.value   = 1;   ttsRateVal.textContent   = '1.0';
    ttsPitch.value  = 1;   ttsPitchVal.textContent  = '1.00';
    ttsLangFilter.value = '';
    populateVoiceList('');
    setStatus('↺ Settings reset', 'idle');
};

function setBtns(active) {
    ttsSpeak.disabled     =  active;
    ttsPauseBtn.disabled  = !active;
    ttsStopBtn.disabled   = !active;
    ttsResumeBtn.disabled = true;
}

function setStatus(msg, state) {
    ttsStatus.textContent = msg;
    ttsStatus.className = `tts-status tts-status--${state}`;

}
