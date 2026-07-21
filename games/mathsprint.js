NumPlay.register({
    id: 'mathsprint',
    name: 'Math Sprint',
    icon: '\u26a1',
    desc: 'Jawab operasi matematika secepat mungkin dalam 30 detik! Tambah, kurang, kali.',
    color: '#ef4444',
    bg: '#fef2f2',

    state: {},
    audioCtx: null,
    musicNodes: [],

    initAudio: function() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    playBeat: function() {
        this.initAudio();
        var ctx = this.audioCtx;
        var now = ctx.currentTime;
        var bpm = 150;
        var step = 60 / bpm / 2;

        for (var i = 0; i < 32; i++) {
            var t = now + i * step;

            var kick = ctx.createOscillator();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(150, t);
            kick.frequency.exponentialRampToValueAtTime(30, t + 0.1);
            var kickGain = ctx.createGain();
            kickGain.gain.setValueAtTime(0.4, t);
            kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            kick.connect(kickGain);
            kickGain.connect(ctx.destination);
            kick.start(t);
            kick.stop(t + 0.15);
            this.musicNodes.push(kick);

            if (i % 2 === 1) {
                var snare = ctx.createOscillator();
                snare.type = 'sawtooth';
                snare.frequency.setValueAtTime(200, t);
                snare.frequency.exponentialRampToValueAtTime(80, t + 0.08);
                var snareGain = ctx.createGain();
                snareGain.gain.setValueAtTime(0.15, t);
                snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                snare.connect(snareGain);
                snareGain.connect(ctx.destination);
                snare.start(t);
                snare.stop(t + 0.1);
                this.musicNodes.push(snare);

                var noise = ctx.createOscillator();
                noise.type = 'square';
                noise.frequency.setValueAtTime(800 + Math.random() * 400, t);
                var noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.06, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start(t);
                noise.stop(t + 0.06);
                this.musicNodes.push(noise);
            }

            if (i % 4 === 0) {
                var bass = ctx.createOscillator();
                bass.type = 'sawtooth';
                var notes = [55, 65, 73, 82];
                bass.frequency.setValueAtTime(notes[Math.floor(i / 4) % 4], t);
                var bassGain = ctx.createGain();
                bassGain.gain.setValueAtTime(0.12, t);
                bassGain.gain.exponentialRampToValueAtTime(0.001, t + step * 2);
                var bassFilter = ctx.createBiquadFilter();
                bassFilter.type = 'lowpass';
                bassFilter.frequency.setValueAtTime(300, t);
                bass.connect(bassFilter);
                bassFilter.connect(bassGain);
                bassGain.connect(ctx.destination);
                bass.start(t);
                bass.stop(t + step * 2);
                this.musicNodes.push(bass);
            }

            var hi = ctx.createOscillator();
            hi.type = 'square';
            hi.frequency.setValueAtTime(6000 + (i % 4) * 200, t);
            var hiGain = ctx.createGain();
            hiGain.gain.setValueAtTime(0.02, t);
            hiGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
            hi.connect(hiGain);
            hiGain.connect(ctx.destination);
            hi.start(t);
            hi.stop(t + 0.03);
            this.musicNodes.push(hi);
        }
    },

    playCorrect: function() {
        this.initAudio();
        var ctx = this.audioCtx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.05);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    },

    playWrong: function() {
        this.initAudio();
        var ctx = this.audioCtx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.1);
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    },

    playEnd: function() {
        this.initAudio();
        var ctx = this.audioCtx;
        var now = ctx.currentTime;
        var notes = [440, 550, 660, 880];
        for (var i = 0; i < notes.length; i++) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], now + i * 0.12);
            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.3);
        }
    },

    stopMusic: function() {
        for (var i = 0; i < this.musicNodes.length; i++) {
            try { this.musicNodes[i].stop(); } catch(e) {}
        }
        this.musicNodes = [];
    },

    reset: function() {
        this.stopMusic();
        var s = this.state;
        s.score = 0;
        s.streak = 0;
        s.best = s.best || 0;
        s.timeLeft = 30;
        s.active = false;
        s.timer = null;
        s.current = null;
        s.musicTimer = null;
        NumPlay.el('MS_score').textContent = '0';
        NumPlay.el('MS_streak').textContent = '0';
        NumPlay.el('MS_best').textContent = s.best;
        NumPlay.el('MS_time').textContent = '30';
        NumPlay.el('MS_time').style.color = '#1a1a2e';
        NumPlay.el('MS_feedback').textContent = 'Tekan Mulai!';
        NumPlay.el('MS_feedback').className = 'fb-card';
        NumPlay.el('MS_question').textContent = '?';
        NumPlay.el('MS_question').style.color = '#1a1a2e';
        NumPlay.el('MS_options').innerHTML = '';
        NumPlay.el('MS_start').style.display = '';
    },

    genProblem: function() {
        var ops = ['+', '-', '\u00d7'];
        var op = ops[Math.floor(Math.random() * ops.length)];
        var a, b, answer;

        if (op === '+') {
            a = Math.floor(Math.random() * 50) + 1;
            b = Math.floor(Math.random() * 50) + 1;
            answer = a + b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
        } else {
            a = Math.floor(Math.random() * 12) + 2;
            b = Math.floor(Math.random() * 12) + 2;
            answer = a * b;
        }

        var options = [answer];
        while (options.length < 4) {
            var fake = answer + Math.floor(Math.random() * 20) - 10;
            if (fake !== answer && fake > 0 && options.indexOf(fake) === -1) {
                options.push(fake);
            }
        }

        for (var i = options.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = options[i]; options[i] = options[j]; options[j] = tmp;
        }

        return { text: a + ' ' + op + ' ' + b, answer: answer, options: options };
    },

    showProblem: function() {
        var s = this.state;
        s.current = this.genProblem();
        NumPlay.el('MS_question').textContent = s.current.text + ' = ?';
        NumPlay.el('MS_question').style.color = '#1a1a2e';

        var html = '';
        for (var i = 0; i < s.current.options.length; i++) {
            html += '<button class="vkb-key wide" style="width:72px;height:52px;font-size:18px;margin:3px" onclick="NumPlay.games.mathsprint.answer(' + s.current.options[i] + ')">' + s.current.options[i] + '</button>';
        }
        NumPlay.el('MS_options').innerHTML = html;
    },

    answer: function(val) {
        var s = this.state;
        if (!s.active || !s.current) return;

        if (val === s.current.answer) {
            s.score++;
            s.streak++;
            if (s.streak > 3) s.score++;
            NumPlay.el('MS_score').textContent = s.score;
            NumPlay.el('MS_streak').textContent = s.streak;
            NumPlay.el('MS_feedback').textContent = '\u2714 Benar!';
            NumPlay.el('MS_feedback').className = 'fb-card ok';
            NumPlay.el('MS_question').style.color = '#16a34a';
            this.playCorrect();
        } else {
            s.streak = 0;
            NumPlay.el('MS_streak').textContent = '0';
            NumPlay.el('MS_feedback').textContent = '\u2716 Salah! Jawaban: ' + s.current.answer;
            NumPlay.el('MS_feedback').className = 'fb-card high';
            NumPlay.el('MS_question').style.color = '#dc2626';
            this.playWrong();
        }

        var self = this;
        setTimeout(function() { if (s.active) self.showProblem(); }, 400);
    },

    start: function() {
        var s = this.state;
        s.score = 0;
        s.streak = 0;
        s.timeLeft = 30;
        s.active = true;
        NumPlay.el('MS_score').textContent = '0';
        NumPlay.el('MS_streak').textContent = '0';
        NumPlay.el('MS_time').textContent = '30';
        NumPlay.el('MS_time').style.color = '#1a1a2e';
        NumPlay.el('MS_start').style.display = 'none';
        NumPlay.el('MS_feedback').textContent = 'Jawab secepat mungkin!';
        NumPlay.el('MS_feedback').className = 'fb-card';

        this.playBeat();
        var self = this;
        s.musicTimer = setInterval(function() { self.playBeat(); }, 1500);
        this.showProblem();

        s.timer = setInterval(function() {
            s.timeLeft--;
            NumPlay.el('MS_time').textContent = s.timeLeft;
            if (s.timeLeft <= 5) NumPlay.el('MS_time').style.color = '#dc2626';
            else if (s.timeLeft <= 10) NumPlay.el('MS_time').style.color = '#f59e0b';

            if (s.timeLeft <= 0) {
                clearInterval(s.timer);
                clearInterval(s.musicTimer);
                self.stopMusic();
                self.playEnd();
                s.active = false;
                if (s.score > s.best) s.best = s.score;
                NumPlay.el('MS_best').textContent = s.best;
                NumPlay.el('MS_feedback').textContent = 'Waktu habis!';
                NumPlay.el('MS_feedback').className = 'fb-card err';
                NumPlay.el('MS_question').textContent = s.score + ' poin';
                NumPlay.el('MS_question').style.color = '#6366f1';
                NumPlay.el('MS_options').innerHTML = '';
                NumPlay.el('MS_start').style.display = '';
                NumPlay.el('MS_start').textContent = 'Main Lagi';
                NumPlay.showModal('\u26a1', 'Waktu Habis!', s.score + ' poin', s.score > 0 && s.score >= s.best ? 'Skor baru!' : '', function() { self.reset(); });
            }
        }, 1000);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Jawab operasi matematika secepat mungkin!') +
            '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px">' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#ef4444" id="MS_time">30</div><div style="font-size:10px;color:#94a3b8;font-weight:700">DETIK</div></div>' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#6366f1" id="MS_score">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">POIN</div></div>' +
            '</div>' +
            '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px">' +
                '<div style="text-align:center"><span style="font-size:20px;font-weight:800;color:#f59e0b" id="MS_streak">0</span><div style="font-size:10px;color:#94a3b8;font-weight:700">STREAK</div></div>' +
                '<div style="text-align:center"><span style="font-size:20px;font-weight:800;color:#10b981" id="MS_best">0</span><div style="font-size:10px;color:#94a3b8;font-weight:700">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="MS_feedback" style="font-size:15px;font-weight:700">Tekan Mulai!</div>' +
            '<div style="text-align:center;font-size:36px;font-weight:800;margin:18px 0;min-height:52px" id="MS_question">?</div>' +
            '<div id="MS_options" style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:18px"></div>' +
            '<button class="btn" id="MS_start" onclick="NumPlay.games.mathsprint.start()" style="width:100%;font-size:16px;padding:16px">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});