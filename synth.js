const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const activeOscillators = new Map();

function playSound(frequency, keyId) {
    if (activeOscillators.has(keyId)) return; // Already playing this note

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Semisine waveform
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

    // Smooth release
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);

    setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
    }, 400);

    activeOscillators.delete(keyId);
}