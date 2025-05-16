const context = new (window.AudioContext || window.webkitAudioContext)();
const startFrequency = 110; // A2
const numKeys = 140; // Fixed number of keys
const activeOscillators = {};
let currentEDO = 12;

const presetSelect = document.getElementById("preset-select");
presetSelect.addEventListener("change", (e) => {
    currentEDO = parseInt(e.target.value);
    generateKeys();
});

function calculateFrequency(index) {
    const stepRatio = Math.pow(2, 1 / currentEDO);
    return startFrequency * Math.pow(stepRatio, index);
}

function calculateCents(index) {
    const cents = (1200 / currentEDO) * index;
    return cents.toFixed(2);
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

    key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        playFrequency(index);
    });
    key.addEventListener("touchend", () => stopFrequency(index));

    return key;
}

function generateKeys() {
    const grid = document.getElementById("key-grid");
    grid.innerHTML = "";
    
    for (let i = 0; i < numKeys; i++) {
        const key = createKey(i);
        grid.appendChild(key);
    }
}

generateKeys();