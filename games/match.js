NumPlay.register({
    id: 'match',
    name: 'Number Match',
    icon: '\ud83c\udfaf',
    desc: 'Cari 2 angka yang jumlahnya sama dengan target! Cepat dan tepat!',
    color: '#06b6d4',
    bg: '#ecfeff',

    state: {},

    playSound: function(f) { NumPlay.sfx(f); },

    reset: function() {
        var s = this.state;
        s.score = 0;
        s.best = s.best || 0;
        s.timeLeft = 30;
        s.active = false;
        s.timer = null;
        s.target = 0;
        s.grid = [];
        s.selected = [];
        s.found = [];
        NumPlay.el('NM_score2').textContent = '0';
        NumPlay.el('NM_best2').textContent = s.best;
        NumPlay.el('NM_time2').textContent = '30';
        NumPlay.el('NM_time2').style.color = '#1a1a2e';
        NumPlay.el('NM_target').textContent = '?';
        NumPlay.el('NM_feedback2').textContent = 'Tekan Mulai!';
        NumPlay.el('NM_feedback2').className = 'fb-card';
        NumPlay.el('NM_grid').innerHTML = '';
        NumPlay.el('NM_start2').style.display = '';
    },

    genGrid: function() {
        var s = this.state;
        var size = 16;
        var numbers = [];
        var maxNum = 20;

        var target = Math.floor(Math.random() * (maxNum - 4)) + 5;
        s.target = target;
        NumPlay.el('NM_target').textContent = target;

        var pairPlaced = false;
        for (var i = 0; i < size; i++) {
            if (!pairPlaced && i < size - 1) {
                var a = Math.floor(Math.random() * (target - 1)) + 1;
                var b = target - a;
                if (b > 0 && b <= maxNum) {
                    numbers.push(a);
                    numbers.push(b);
                    i++;
                    pairPlaced = true;
                    continue;
                }
            }
            numbers.push(Math.floor(Math.random() * maxNum) + 1);
        }

        for (var i = numbers.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = numbers[i]; numbers[i] = numbers[j]; numbers[j] = tmp;
        }

        s.grid = numbers;
        s.selected = [];
        s.found = [];
        this.renderGrid();
    },

    renderGrid: function() {
        var s = this.state;
        var html = '';
        for (var i = 0; i < s.grid.length; i++) {
            var sel = s.selected.indexOf(i) !== -1;
            var found = s.found.indexOf(i) !== -1;
            var cls = 'nm-cell';
            if (found) cls += ' found';
            else if (sel) cls += ' selected';
            html += '<button class="' + cls + '" onclick="NumPlay.games.match.tap(' + i + ')">' + s.grid[i] + '</button>';
        }
        NumPlay.el('NM_grid').innerHTML = html;
    },

    tap: function(idx) {
        var s = this.state;
        if (!s.active) return;
        if (s.found.indexOf(idx) !== -1) return;
        if (s.selected.indexOf(idx) !== -1) {
            s.selected.splice(s.selected.indexOf(idx), 1);
            this.renderGrid();
            return;
        }

        s.selected.push(idx);
        this.playSound('click.wav');
        this.renderGrid();

        if (s.selected.length === 2) {
            var a = s.grid[s.selected[0]];
            var b = s.grid[s.selected[1]];
            var self = this;

            if (a + b === s.target) {
                s.found.push(s.selected[0]);
                s.found.push(s.selected[1]);
                s.score += 10;
                NumPlay.el('NM_score2').textContent = s.score;
                NumPlay.el('NM_feedback2').textContent = '\u2714 Pas! ' + a + ' + ' + b + ' = ' + s.target;
                NumPlay.el('NM_feedback2').className = 'fb-card ok';
                this.playSound('correct.wav');
                s.selected = [];
                this.renderGrid();

                if (s.found.length === s.grid.length) {
                    setTimeout(function() { self.genGrid(); }, 500);
                }
            } else {
                NumPlay.el('NM_feedback2').textContent = '\u2716 ' + a + ' + ' + b + ' = ' + (a+b) + ' bukan ' + s.target;
                NumPlay.el('NM_feedback2').className = 'fb-card high';
                this.playSound('wrong.wav');
                s.selected = [];
                setTimeout(function() { self.renderGrid(); }, 400);
            }
        }
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        s.score = 0;
        s.timeLeft = 30;
        s.active = true;
        NumPlay.el('NM_score2').textContent = '0';
        NumPlay.el('NM_time2').textContent = '30';
        NumPlay.el('NM_time2').style.color = '#1a1a2e';
        NumPlay.el('NM_start2').style.display = 'none';
        NumPlay.el('NM_feedback2').textContent = 'Cari 2 angka yang jumlahnya = target!';
        NumPlay.el('NM_feedback2').className = 'fb-card';

        this.genGrid();

        var self = this;
        s.timer = setInterval(function() {
            s.timeLeft--;
            NumPlay.el('NM_time2').textContent = s.timeLeft;
            if (s.timeLeft <= 5) {
                NumPlay.el('NM_time2').style.color = '#dc2626';
                self.playSound('tick.wav');
            } else if (s.timeLeft <= 10) {
                NumPlay.el('NM_time2').style.color = '#f59e0b';
            }

            if (s.timeLeft <= 0) {
                clearInterval(s.timer);
                s.timer = null;
                s.active = false;
                if (s.score > s.best) s.best = s.score;
                NumPlay.el('NM_best2').textContent = s.best;
                NumPlay.el('NM_feedback2').textContent = 'Waktu habis!';
                NumPlay.el('NM_feedback2').className = 'fb-card err';
                NumPlay.el('NM_start2').style.display = '';
                NumPlay.el('NM_start2').textContent = 'Main Lagi';
                self.playSound('end.wav');
                NumPlay.showModal('\ud83c\udfaf', 'Waktu Habis!', s.score + ' poin', s.score >= s.best && s.score > 0 ? 'Skor baru!' : '', function() { self.reset(); });
            }
        }, 1000);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Cari 2 angka yang jumlahnya = target!') +
            '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:14px">' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#06b6d4" id="NM_time2">30</div><div style="font-size:10px;color:#94a3b8;font-weight:700">DETIK</div></div>' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#6366f1" id="NM_score2">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">POIN</div></div>' +
            '</div>' +
            '<div style="text-align:center;margin-bottom:12px"><span style="font-size:13px;color:#94a3b8;font-weight:700">TARGET: </span><span style="font-size:32px;font-weight:800;color:#06b6d4" id="NM_target">?</span><span style="font-size:13px;color:#94a3b8;font-weight:700"> | TERBAIK: </span><span style="font-size:20px;font-weight:800;color:#10b981" id="NM_best2">0</span></div>' +
            '<div class="fb-card" id="NM_feedback2" style="font-size:14px;font-weight:700;margin-bottom:12px">Tekan Mulai!</div>' +
            '<div id="NM_grid" class="nm-grid"></div>' +
            '<button class="btn" id="NM_start2" onclick="NumPlay.games.match.start()" style="width:100%;font-size:16px;padding:16px;margin-top:12px">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});