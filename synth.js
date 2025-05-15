const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = new Map();

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

// Keep track of keys currently pressed
const keysPressed = new Set();

function onPointerDown(freq, keyId) {
    playSound(freq, keyId);
    keysPressed.add(keyId);
}

function onPointerUp(keyId) {
    stopSound(keyId);
    keysPressed.delete(keyId);
}

// Stop all sounds on pointer up outside keys
function stopAllSounds() {
    for (const keyId of keysPressed) {
        stopSound(keyId);
    }
    keysPressed.clear();
}

// Add global event listeners to stop sounds on mouseup or touchend outside keys
document.addEventListener('mouseup', stopAllSounds);
document.addEventListener('touchend', stopAllSounds);
document.addEventListener('touchcancel', stopAllSounds);