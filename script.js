const context = new (window.AudioContext || window.webkitAudioContext)();
const baseFrequency = 27.5; // A0
const numColumns = 14;
const numRows = 20;
const numKeys = numColumns * numRows;
const activeOscillators = {};
let currentEDO = 12;
let customRatio = 2;  // Default to octave

const presetSelect = document.getElementById("preset-select");
const customInput = document.getElementById("custom-tuning");

presetSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "custom") {
        customInput.style.display = "inline-block";  // Show input field
    } else {
        customInput.style.display = "none";  // Hide input field
        customInput.value = "";  // Clear custom input field
        currentEDO = parseInt(value);
        customRatio = 2;  // Reset to octave for standard presets
        generateKeys();
    }
});

customInput.addEventListener("input", () => {
    const input = customInput.value.trim();
    const customMatch = input.match(/^(\d+)-ed(\d+\/\d+|\d+)$/);

    if (customMatch) {
        currentEDO = parseInt(customMatch[1]);
        const ratioString = customMatch[2];

        if (ratioString.includes("/")) {
            const [num, denom] = ratioString.split("/").map(Number);
            customRatio = num / denom;
        } else {
            customRatio = parseFloat(ratioString);
        }

        generateKeys();
    }
});

function calculateFrequency(index) {
    const stepRatio = Math.pow(customRatio, 1 / currentEDO);
    return baseFrequency * Math.pow(stepRatio, index);
}

function calculateCents(index) {
    const cents = (1200 * Math.log2(Math.pow(customRatio, index / currentEDO)));
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