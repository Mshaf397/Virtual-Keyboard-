const keyboard = document.getElementById("keyboard");
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Define the frequencies for each key in a 20x14 grid
const frequencies = Array.from({ length: 14 }, (_, row) => 
    Array.from({ length: 20 }, (_, col) => 220 + (row * 20 + col) * 5)
);

// Create the keyboard keys
for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 20; col++) {
        const key = document.createElement("div");
        key.classList.add("key");
        key.textContent = `${row},${col}`;
        key.dataset.frequency = frequencies[row][col];
        key.addEventListener("mousedown", playNote);
        key.addEventListener("mouseup", stopNote);
        keyboard.appendChild(key);
    }
}

let oscillator = null;

function playNote(e) {
    const frequency = parseFloat(e.target.dataset.frequency);
    oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
}

function stopNote() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}