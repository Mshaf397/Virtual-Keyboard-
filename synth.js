document.addEventListener("DOMContentLoaded", () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const activeOscillators = {};

    function createSemisineWave(frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;

        // Create semisine waveform
        const real = new Float32Array([0, 1, 0.5, 0, 0.25]);
        const imag = new Float32Array(real.length);
        const wave = audioContext.createPeriodicWave(real, imag);

        oscillator.setPeriodicWave(wave);
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode).connect(audioContext.destination);
        return { oscillator, gainNode };
    }

    function playSound(freq, key) {
        if (!activeOscillators[key]) {
            const { oscillator, gainNode } = createSemisineWave(freq);
            oscillator.start();
            activeOscillators[key] = { oscillator, gainNode };
        }
    }

    function stopSound(key) {
        if (activeOscillators[key]) {
            const { oscillator, gainNode } = activeOscillators[key];
            gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
            oscillator.stop(audioContext.currentTime + 0.2);
            delete activeOscillators[key];
        }
    }

    document.querySelectorAll(".key").forEach(keyElement => {
        const frequency = parseFloat(keyElement.dataset.freq);
        const key = keyElement.dataset.name;

        keyElement.addEventListener("mousedown", () => playSound(frequency, key));
        keyElement.addEventListener("touchstart", (e) => {
            e.preventDefault();
            playSound(frequency, key);
        });

        keyElement.addEventListener("mouseup", () => stopSound(key));
        keyElement.addEventListener("mouseleave", () => stopSound(key));
        keyElement.addEventListener("touchend", () => stopSound(key));
        keyElement.addEventListener("touchcancel", () => stopSound(key));
    });
});