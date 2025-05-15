function playSound(frequency) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Semisine waveform: Custom waveform resembling a sine wave
    const waveArray = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
        waveArray[i] = Math.sin((i / 256) * Math.PI);
    }
    const wave = audioContext.createPeriodicWave(waveArray, waveArray);
    oscillator.setPeriodicWave(wave);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}