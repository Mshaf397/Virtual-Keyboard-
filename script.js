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

// Panic button to stop all notes
document.getElementById("panicButton").addEventListener("click", () => {
    stopAllNotes();
    console.log("Panic Button Pressed - All Notes Stopped");
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

        // Mouse Events
        key.addEventListener("mousedown", playNote);
        key.addEventListener("mouseup", stopNote);
        key.addEventListener("mouseenter", (e) => {
            if (isMouseDown) playNote(e);
        });

        // Touch Events
        key.addEventListener("touchstart", playNote, { passive: false });
        key.addEventListener("touchend", stopNote, { passive: false });
        key.addEventListener("touchmove", handleTouchMove, { passive: false });

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

    e.preventDefault();
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

// Handle touch movement
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.classList.contains("key")) {
        playNote({ target });
    }
}

// Stop a note
function stopNote(e) {
    e.preventDefault();
    const keyId = e.target.dataset.keyId;

    if (activeOscillators[keyId]) {
        activeOscillators[keyId].stop();
        activeOscillators[keyId].disconnect();
        delete activeOscillators[keyId];
        e.target.classList.remove("active");
    }
}

// Stop all notes
function stopAllNotes() {
    for (const keyId in activeOscillators) {
        activeOscillators[keyId].stop();
        activeOscillators[keyId].disconnect();
        delete activeOscillators[keyId];
    }

    document.querySelectorAll(".key.active").forEach(key => key.classList.remove("active"));
}