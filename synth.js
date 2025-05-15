const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = new Map();
const keysPressed = new Set();
const baseFrequency = 220; // Base frequency (A3) - can be adjusted

// Generate 70 unique frequencies
const keys = [];
for (let i = 0; i < 70; i++) {
    const frequency = baseFrequency * Math.pow(2, i / 70); // Exponential scaling
    const color = `hsl(${(i * 5) % 360}, 70%, 60%)`;
    const name = `K${i + 1}`;
    keys.push({ name, freq: frequency, color });
}

// Generate the grid of keys
const keyGrid = document.getElementById("key-grid");
keys.forEach(key => {
    const keyElement = document.createElement("div");
    keyElement.className = "key";
    keyElement.style.backgroundColor = key.color;
    keyElement.textContent = key.name;

    keyElement.onpointerdown = () => onPointerDown(key.freq, key.name);
    keyElement.onpointerup = () => onPointerUp(key.name);
    keyElement.onpointerleave = () => onPointerUp(key.name);
    keyElement.onpointercancel = () => onPointerUp(key.name);

    keyGrid.appendChild(keyElement);
});

function playSound(frequency, keyId) {
    if (activeOscillators.has(keyId)) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const real = new Float32Array([0, 1]);
    const imag = new Float32Array([0, 0.5]);
    const wave = audioContext.createPeriodicWave(real, imag);
    oscillator.setPeriodicWave(wave);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    activeOscillators.set(keyId, { oscillator, gainNode });
}

function stopSound(keyId) {
    if (!activeOscillators.has(keyId)) return;

    const { oscillator, gainNode } = activeOscillators.get(keyId);

    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);

    setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
    }, 400);

    activeOscillators.delete(keyId);
}

function onPointerDown(freq, keyId) {
    playSound(freq, keyId);
    keysPressed.add(keyId);
}

function onPointerUp(keyId) {
    stopSound(keyId);
    keysPressed.delete(keyId);
}

function stopAllSounds() {
    for (const keyId of keysPressed) {
        stopSound(keyId);
    }
    keysPressed.clear();
}

// Global event listeners for pointer events
document.addEventListener('pointerup', stopAllSounds);
document.addEventListener('pointercancel', stopAllSounds);