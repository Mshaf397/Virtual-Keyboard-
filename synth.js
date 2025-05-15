function playSound(frequency) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Define the semisine waveform
    const real = new Float32Array([0, 1]);
    const imag = new Float32Array([0, 0.5]);  // Adjust the 0.5 value to control the shape

    const wave = audioContext.createPeriodicWave(real, imag);
    oscillator.setPeriodicWave(wave);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}