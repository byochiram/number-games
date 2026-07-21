NumPlay.register({
    id: 'mathsprint',
    name: 'Math Sprint',
    icon: '\u26a1',
    desc: 'Jawab operasi matematika secepat mungkin dalam 30 detik! Tambah, kurang, kali.',
    color: '#ef4444',
    bg: '#fef2f2',

    state: {},
    bgMusic: null,

    playSound: function(file) {
        try {
            var audio = new Audio('sounds/' + file);
            audio.volume = 0.3;
            audio.play();
        } catch(e) {}
    },

    startMusic: function() {
        try {
            if (!this.bgMusic) {
                this.bgMusic = new Audio('sounds/music.mp4');
                this.bgMusic.loop = true;
                this.bgMusic.volume = 0.15;
            }
            this.bgMusic.currentTime = 0;
            this.bgMusic.play();
        } catch(e) {}
    },

    stopMusic: function() {
        try {
            if (this.bgMusic) {
                this.bgMusic.pause();
                this.bgMusic.currentTime = 0;
            }
        } catch(e) {}
    },

    playCorrect: function() { this.playSound('correct.wav'); },
    playWrong: function() { this.playSound('wrong.wav'); },
    playTick: function() { this.playSound('tick.wav'); },
    playEnd: function() {
        this.stopMusic();
        this.playSound('end.wav');
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
            html += '<button class="ms-opt" onclick="NumPlay.games.mathsprint.answer(' + s.current.options[i] + ')">' + s.current.options[i] + '</button>';
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

        this.startMusic();
        this.showProblem();

        var self = this;
        s.timer = setInterval(function() {
            s.timeLeft--;
            NumPlay.el('MS_time').textContent = s.timeLeft;
            if (s.timeLeft <= 5) {
                NumPlay.el('MS_time').style.color = '#dc2626';
                self.playTick();
            } else if (s.timeLeft <= 10) {
                NumPlay.el('MS_time').style.color = '#f59e0b';
            }

            if (s.timeLeft <= 0) {
                clearInterval(s.timer);
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
            '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:16px">' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#ef4444" id="MS_time">30</div><div style="font-size:10px;color:#94a3b8;font-weight:700">DETIK</div></div>' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#6366f1" id="MS_score">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">POIN</div></div>' +
            '</div>' +
            '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:16px">' +
                '<div style="text-align:center"><span style="font-size:20px;font-weight:800;color:#f59e0b" id="MS_streak">0</span><div style="font-size:10px;color:#94a3b8;font-weight:700">STREAK</div></div>' +
                '<div style="text-align:center"><span style="font-size:20px;font-weight:800;color:#10b981" id="MS_best">0</span><div style="font-size:10px;color:#94a3b8;font-weight:700">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="MS_feedback" style="font-size:15px;font-weight:700">Tekan Mulai!</div>' +
            '<div style="text-align:center;font-size:36px;font-weight:800;margin:18px 0;min-height:52px" id="MS_question">?</div>' +
            '<div id="MS_options" class="ms-grid"></div>' +
            '<button class="btn" id="MS_start" onclick="NumPlay.games.mathsprint.start()" style="width:100%;font-size:16px;padding:16px">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});