/* ============================================
   Rains — audio.js
   全局剧场声音系统
   ============================================ */
(function() {
    'use strict';

    window.RainsAudio = (function() {
        var ctx = null;
        var muted = localStorage.getItem('rains_audio_muted') === '1';
        var NOTES = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50, Cs5: 554.37 };

        function ensureCtx() {
            if (!ctx) {
                try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
                catch (e) { return null; }
            }
            if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e) {} }
            return ctx;
        }

        function tone(freq, start, dur, type, vol) {
            var c = ensureCtx();
            if (!c || muted) return;
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, c.currentTime + start);
            gain.gain.setValueAtTime(0, c.currentTime + start);
            gain.gain.linearRampToValueAtTime(vol || 0.2, c.currentTime + start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime + start);
            osc.stop(c.currentTime + start + dur + 0.05);
        }

        return {
            isMuted: function() { return muted; },
            setMuted: function(m) {
                muted = m;
                if (m) localStorage.setItem('rains_audio_muted', '1');
                else localStorage.removeItem('rains_audio_muted');
            },
            unlock: function() { ensureCtx(); },
            playOverture: function(cb) {
                if (muted) { if (cb) cb(); return; }
                var c = ensureCtx();
                if (!c) { if (cb) cb(); return; }
                var seq = [[NOTES.C5,0,0.35],[NOTES.E5,0.32,0.35],[NOTES.G5,0.64,0.35],[NOTES.C6,0.96,0.7]];
                seq.forEach(function(n) { tone(n[0], n[1], n[2], 'triangle', 0.18); });
                tone(NOTES.C5 / 2, 0, 1.8, 'sine', 0.08);
                if (cb) setTimeout(cb, 1700);
            },
            playEntracte: function() {
                tone(NOTES.G5, 0, 0.18, 'triangle', 0.15);
                tone(NOTES.C6, 0.16, 0.3, 'triangle', 0.15);
            },
            playFinale: function() {
                tone(NOTES.C6, 0, 0.4, 'triangle', 0.18);
                tone(NOTES.G5, 0.35, 0.4, 'triangle', 0.16);
                tone(NOTES.E5, 0.7, 0.8, 'triangle', 0.14);
                tone(NOTES.C5, 0.7, 0.8, 'sine', 0.08);
            },
            playApplause: function() {
                var c = ensureCtx();
                if (!c || muted) return;
                var bufferSize = c.sampleRate * 2;
                var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
                var data = buffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * (1 - Math.abs(i / bufferSize - 0.5) * 1.5);
                }
                var src = c.createBufferSource();
                src.buffer = buffer;
                var filter = c.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1200;
                filter.Q.value = 0.8;
                var gain = c.createGain();
                gain.gain.setValueAtTime(0, c.currentTime);
                gain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.3);
                gain.gain.linearRampToValueAtTime(0.1, c.currentTime + 1.2);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2);
                src.connect(filter);
                filter.connect(gain);
                gain.connect(c.destination);
                src.start();
                src.stop(c.currentTime + 2.1);
            },
            playSuccess: function() {
                tone(NOTES.C5, 0, 0.4, 'triangle', 0.15);
                tone(NOTES.E5, 0, 0.4, 'triangle', 0.12);
                tone(NOTES.G5, 0, 0.5, 'triangle', 0.12);
            },
            playError: function() {
                tone(NOTES.C5, 0, 0.35, 'sawtooth', 0.1);
                tone(NOTES.Cs5, 0, 0.35, 'sawtooth', 0.1);
            }
        };
    })();
})();
