const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = new Map();
const keysPressed = new Set();

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

// Global event listeners to handle pointer up and cancel
document.addEventListener('pointerup', stopAllSounds);
document.addEventListener('pointercancel', stopAllSounds);