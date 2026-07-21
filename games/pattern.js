NumPlay.register({
    id: 'pattern',
    name: 'Pattern Guess',
    icon: '\ud83d\udd22',
    desc: 'Tebak angka berikutnya dalam deret! Logika + insting!',
    color: '#f59e0b',
    bg: '#fffbeb',

    state: {},

    reset: function() {
        var s = this.state;
        s.score = 0;
        s.best = s.best || 0;
        s.streak = 0;
        s.level = 1;
        s.timeLeft = 0;
        s.active = false;
        s.timer = null;
        s.current = null;
        NumPlay.el('PG_score').textContent = '0';
        NumPlay.el('PG_best').textContent = s.best;
        NumPlay.el('PG_level').textContent = '1';
        NumPlay.el('PG_streak').textContent = '0';
        NumPlay.el('PG_feedback').textContent = 'Tekan Mulai!';
        NumPlay.el('PG_feedback').className = 'fb-card';
        NumPlay.el('PG_sequence').innerHTML = '';
        NumPlay.el('PG_options').innerHTML = '';
        NumPlay.el('PG_start').style.display = '';
    },

    genProblem: function(level) {
        var types = [];

        types.push(function() {
            var start = Math.floor(Math.random() * 10) + 1;
            var step = Math.floor(Math.random() * 5) + 1;
            var seq = [];
            for (var i = 0; i < 5; i++) seq.push(start + step * i);
            return { seq: seq, answer: start + step * 5, hint: '+' + step };
        });

        types.push(function() {
            var start = Math.floor(Math.random() * 20) + 10;
            var step = Math.floor(Math.random() * 5) + 1;
            var seq = [];
            for (var i = 0; i < 5; i++) seq.push(start - step * i);
            return { seq: seq, answer: start - step * 5, hint: '-' + step };
        });

        types.push(function() {
            var base = Math.floor(Math.random() * 5) + 2;
            var seq = [];
            for (var i = 1; i <= 5; i++) seq.push(base * i);
            return { seq: seq, answer: base * 6, hint: 'x' + base };
        });

        types.push(function() {
            var seq = [];
            for (var i = 1; i <= 5; i++) seq.push(i * i);
            return { seq: seq, answer: 36, hint: 'n\u00b2' };
        });

        types.push(function() {
            var seq = [];
            for (var i = 2; i <= 6; i++) seq.push(i * i);
            return { seq: seq, answer: 49, hint: 'n\u00b2' };
        });

        if (level >= 2) {
            types.push(function() {
                var a = Math.floor(Math.random() * 3) + 1;
                var b = Math.floor(Math.random() * 3) + 1;
                var seq = [a, b];
                for (var i = 0; i < 3; i++) seq.push(seq[seq.length-1] + seq[seq.length-2]);
                return { seq: seq, answer: seq[seq.length-1] + seq[seq.length-2], hint: 'a+b' };
            });

            types.push(function() {
                var start = Math.floor(Math.random() * 5) + 2;
                var seq = [];
                for (var i = 0; i < 5; i++) seq.push(start * Math.pow(2, i));
                return { seq: seq, answer: start * 32, hint: 'x2' };
            });

            types.push(function() {
                var seq = [];
                for (var i = 1; i <= 5; i++) seq.push(i * (i + 1) / 2);
                return { seq: seq, answer: 21, hint: 'triangle' };
            });
        }

        if (level >= 3) {
            types.push(function() {
                var base = Math.floor(Math.random() * 3) + 2;
                var seq = [];
                for (var i = 1; i <= 5; i++) seq.push(Math.pow(base, i));
                return { seq: seq, answer: Math.pow(base, 6), hint: base + '\u207f' };
            });

            types.push(function() {
                var seq = [2, 3, 5, 7, 11];
                return { seq: seq, answer: 13, hint: 'prima' };
            });

            types.push(function() {
                var step1 = Math.floor(Math.random() * 3) + 2;
                var step2 = step1 + 1;
                var start = Math.floor(Math.random() * 5) + 1;
                var seq = [start];
                for (var i = 0; i < 4; i++) {
                    seq.push(seq[seq.length-1] + (i % 2 === 0 ? step1 : step2));
                }
                return { seq: seq, answer: seq[seq.length-1] + (4 % 2 === 0 ? step1 : step2), hint: '+' + step1 + ',+' + step2 };
            });
        }

        var idx = Math.floor(Math.random() * types.length);
        return types[idx]();
    },

    showProblem: function() {
        var s = this.state;
        s.current = this.genProblem(s.level);

        var seqHtml = '';
        for (var i = 0; i < s.current.seq.length; i++) {
            seqHtml += '<span class="pg-num">' + s.current.seq[i] + '</span>';
        }
        seqHtml += '<span class="pg-num pg-unknown">?</span>';
        NumPlay.el('PG_sequence').innerHTML = seqHtml;

        var answer = s.current.answer;
        var options = [answer];
        while (options.length < 4) {
            var fake = answer + Math.floor(Math.random() * 20) - 10;
            if (fake !== answer && options.indexOf(fake) === -1) options.push(fake);
        }
        for (var i = options.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = options[i]; options[i] = options[j]; options[j] = tmp;
        }

        var optHtml = '';
        for (var i = 0; i < options.length; i++) {
            optHtml += '<button class="pg-opt" ontouchstart="" onclick="NumPlay.games.pattern.answer(' + options[i] + ')">' + options[i] + '</button>';
        }
        NumPlay.el('PG_options').innerHTML = optHtml;
    },

    answer: function(val) {
        var s = this.state;
        if (!s.active || !s.current) return;

        if (val === s.current.answer) {
            s.score += s.level * 5;
            s.streak++;
            if (s.streak > 3) s.score += s.level * 3;
            NumPlay.el('PG_score').textContent = s.score;
            NumPlay.el('PG_streak').textContent = s.streak;
            NumPlay.el('PG_feedback').textContent = '\u2714 Benar! Pola: ' + s.current.hint;
            NumPlay.el('PG_feedback').className = 'fb-card ok';
            NumPlay.sfx('correct.wav');

            if (s.streak % 5 === 0) {
                s.level++;
                NumPlay.el('PG_level').textContent = s.level;
                NumPlay.el('PG_feedback').textContent = '\ud83d\udd25 Level ' + s.level + '! Pola: ' + s.current.hint;
            }
        } else {
            s.streak = 0;
            NumPlay.el('PG_streak').textContent = '0';
            NumPlay.el('PG_feedback').textContent = '\u2716 Jawaban: ' + s.current.answer + '  (pola: ' + s.current.hint + ')';
            NumPlay.el('PG_feedback').className = 'fb-card high';
            NumPlay.sfx('wrong.wav');
        }

        var self = this;
        setTimeout(function() { if (s.active) self.showProblem(); }, 800);
    },

    start: function() {
        var s = this.state;
        s.score = 0;
        s.streak = 0;
        s.level = 1;
        s.active = true;
        NumPlay.el('PG_score').textContent = '0';
        NumPlay.el('PG_streak').textContent = '0';
        NumPlay.el('PG_level').textContent = '1';
        NumPlay.el('PG_start').style.display = 'none';
        NumPlay.el('PG_feedback').textContent = 'Tebak angka selanjutnya!';
        NumPlay.el('PG_feedback').className = 'fb-card';
        this.showProblem();
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Tebak angka berikutnya dalam deret') +
            '<div style="display:flex;justify-content:center;gap:20px;margin-bottom:12px;flex-wrap:wrap">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#f59e0b" id="PG_level">1</div><div class="nm-stat-lbl">LEVEL</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="PG_score">0</div><div class="nm-stat-lbl">POIN</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#ef4444" id="PG_streak">0</div><div class="nm-stat-lbl">STREAK</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#10b981" id="PG_best">0</div><div class="nm-stat-lbl">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="PG_feedback" style="font-size:14px;font-weight:700;margin-bottom:12px;padding:10px">Tekan Mulai!</div>' +
            '<div id="PG_sequence" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;min-height:48px"></div>' +
            '<div id="PG_options" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:300px;margin:0 auto"></div>' +
            '<button class="btn" id="PG_start" onclick="NumPlay.games.pattern.start()" style="width:100%;font-size:16px;padding:16px;margin-top:14px;background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 4px 16px rgba(245,158,11,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});