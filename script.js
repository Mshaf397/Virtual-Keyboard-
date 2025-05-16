const context = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 110; // A2
const numKeys = 14 * 20;
const semitoneRatio = Math.pow(2, 1 / 12);

function calculateFrequency(index) {
    return startFrequency * Math.pow(semitoneRatio, index);
}

function playFrequency(frequency) {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
}

function createKey(index) {
    const key = document.createElement("div");
    key.className = "key";
    const frequency = calculateFrequency(index);
    key.textContent = frequency.toFixed(2) + " Hz";

    key.addEventListener("mousedown", () => {
        playFrequency(frequency);
    });

    return key;
}

function generateKeys() {
    const grid = document.getElementById("key-grid");
    for (let i = 0; i < numKeys; i++) {
        const key = createKey(i);
        grid.appendChild(key);
    }
}

generateKeys();