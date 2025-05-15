let audioContext = null;
const activeOscillators = {};
let isMouseDown = false;

// Define the frequencies for each key in a 20x14 grid
const frequencies = Array.from({ length: 14 }, (_, row) => 
    Array.from({ length: 20 }, (_, col) => 220 + (row * 20 + col) * 5)
);

// Enable audio context on user interaction
document.getElementById("startAudio").addEventListener("click", () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext enabled");
    }
});

// Create the keyboard keys
const keyboard = document.getElementById("keyboard");

for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 20; col++) {
        const key = document.createElement("div");
        key.classList.add("key");
        key.textContent = `${row},${col}`;
        key.dataset.frequency = frequencies[row][col];
        key.dataset.keyId = `${row}-${col}`;

        key.addEventListener("mousedown", playNote);
        key.addEventListener("mouseenter", (e) => {
            if (isMouseDown) playNote(e);
        });
        key.addEventListener("mouseup", stopNote);
        key.addEventListener("mouseleave", stopNote);

        keyboard.appendChild(key);
    }
}

// Track mouse state globally
document.addEventListener("mousedown", () => {
    isMouseDown = true;
});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
    stopAllNotes();
});

// Play a note and sustain it
function playNote(e) {
    if (!audioContext) return;

    const keyId = e.target.dataset.keyId;
    const frequency = parseFloat(e.target.dataset.frequency);

    if (!activeOscillators[keyId]) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();

        activeOscillators[keyId] = oscillator;
        e.target.classList.add("active");
    }
}

// Stop a note
function stopNote(e) {
    const keyId = e.target.dataset.keyId;

    if (activeOscillators[keyId]) {
        activeOscillators[keyId].stop();
        activeOscillators[keyId].disconnect();
        delete activeOscillators[keyId];
        e.target.classList.remove("active");
    }
}

// Stop all notes when the mouse is released
function stopAllNotes() {
    for (const keyId in activeOscillators) {
        activeOscillators[keyId].stop();
        activeOscillators[keyId].disconnect();
        delete activeOscillators[keyId];
    }

    document.querySelectorAll(".key.active").forEach(key => key.classList.remove("active"));
}