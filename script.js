const context = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 27.5; // A0
const numKeys = 3 * 41;
const semitoneRatio = Math.pow(2, 1 / 9.45);

// To keep track of active oscillators
const activeOscillators = {};

function calculateFrequency(index) {
    return startFrequency * Math.pow(semitoneRatio, index);
}

function calculateCents(index) {
    const referenceIndex = 0;  // A0 as the reference (0 cents)
    const cents = index * 127;
    return cents;
}

function playFrequency(index) {
    const frequency = calculateFrequency(index);

    if (activeOscillators[index]) return;

    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();

    activeOscillators[index] = { oscillator, gainNode };
}

function stopFrequency(index) {
    const oscillatorData = activeOscillators[index];

    if (oscillatorData) {
        oscillatorData.gainNode.gain.setTargetAtTime(0, context.currentTime, 0.1);
        oscillatorData.oscillator.stop(context.currentTime + 0.1);
        delete activeOscillators[index];
    }
}

function createKey(index) {
    const key = document.createElement("div");
    key.className = "key";

    const cents = calculateCents(index);
    key.textContent = `${cents}¢`;

    key.addEventListener("mousedown", () => playFrequency(index));
    key.addEventListener("mouseup", () => stopFrequency(index));
    key.addEventListener("mouseleave", () => stopFrequency(index));

    // Support for touch devices
    key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        playFrequency(index);
    });
    key.addEventListener("touchend", () => stopFrequency(index));

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