NumPlay.register({
    id: 'match',
    name: 'Number Match',
    icon: '\ud83c\udfaf',
    desc: 'Cari pasangan angka yang jumlahnya = target. Temukan semua pasangan!',
    color: '#06b6d4',
    bg: '#ecfeff',

    state: {},
    bgMusic: null,

    initMusic: function() {
        if (!this.bgMusic) {
            this.bgMusic = new Audio('sounds/music.mp4');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.4;
            this.bgMusic.preload = 'auto';
        }
    },

    startMusic: function() {
        this.initMusic();
        try { this.bgMusic.currentTime = 0; this.bgMusic.play().catch(function(){}); } catch(e) {}
    },

    stopMusic: function() {
        try {
            if (this.bgMusic) {
                this.bgMusic.pause();
                this.bgMusic.currentTime = 0;
                this.bgMusic.src = '';
                this.bgMusic.load();
                this.bgMusic = null;
            }
        } catch(e) {}
    },

    reset: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        this.stopMusic();
        var s = this.state;
        s.score = 0;
        s.best = s.best || 0;
        s.timeLeft = 45;
        s.active = false;
        s.timer = null;
        s.target = 0;
        s.grid = [];
        s.selected = [];
        s.found = [];
        s.pairsLeft = 0;
        s.streak = 0;
        NumPlay.el('NM_score2').textContent = '0';
        NumPlay.el('NM_best2').textContent = s.best;
        NumPlay.el('NM_time2').textContent = '45';
        NumPlay.el('NM_time2').style.color = '#1a1a2e';
        NumPlay.el('NM_streak2').textContent = '0';
        NumPlay.el('NM_target').textContent = '?';
        NumPlay.el('NM_target').style.textShadow = 'none';
        NumPlay.el('NM_pairs').textContent = '0';
        NumPlay.el('NM_feedback2').textContent = 'Tekan Mulai!';
        NumPlay.el('NM_feedback2').className = 'fb-card';
        NumPlay.el('NM_grid').innerHTML = '';
        NumPlay.el('NM_start2').style.display = '';
    },

    genGrid: function() {
        var s = this.state;
        var numPairs = 4;
        var target = Math.floor(Math.random() * 12) + 6;
        s.target = target;
        s.found = [];
        s.selected = [];

        var pairs = [];
        var used = {};
        while (pairs.length < numPairs) {
            var a = Math.floor(Math.random() * (target - 1)) + 1;
            var b = target - a;
            if (b < 1) continue;
            var key = Math.min(a, b) + ',' + Math.max(a, b);
            if (used[key]) continue;
            used[key] = true;
            pairs.push([a, b]);
        }

        s.pairsLeft = numPairs;
        var cells = [];
        for (var i = 0; i < pairs.length; i++) {
            cells.push(pairs[i][0]);
            cells.push(pairs[i][1]);
        }
        while (cells.length < 16) {
            cells.push(Math.floor(Math.random() * 18) + 1);
        }
        for (var i = cells.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = cells[i]; cells[i] = cells[j]; cells[j] = tmp;
        }

        s.grid = cells;
        NumPlay.el('NM_target').textContent = target;
        NumPlay.el('NM_target').style.textShadow = '0 0 20px rgba(6,182,212,0.4)';
        NumPlay.el('NM_pairs').textContent = s.pairsLeft;
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
            var content = found ? '\u2713' : s.grid[i];
            html += '<button class="' + cls + '" ontouchstart="" onclick="NumPlay.games.match.tap(' + i + ')">' + content + '</button>';
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

        if (s.selected.length >= 2) return;

        s.selected.push(idx);
        NumPlay.sfx('click.wav');
        this.renderGrid();

        if (s.selected.length === 2) {
            var i0 = s.selected[0], i1 = s.selected[1];
            var a = s.grid[i0], b = s.grid[i1];
            var self = this;

            if (a + b === s.target) {
                s.found.push(i0);
                s.found.push(i1);
                s.pairsLeft--;
                s.streak++;
                var bonus = s.streak > 2 ? 15 : 10;
                s.score += bonus;
                NumPlay.el('NM_score2').textContent = s.score;
                NumPlay.el('NM_pairs').textContent = s.pairsLeft;
                NumPlay.el('NM_streak2').textContent = s.streak;
                var msg = '\u2714 ' + a + ' + ' + b + ' = ' + s.target;
                if (s.streak > 2) msg += '  (streak x' + s.streak + '!)';
                msg += '  (' + s.pairsLeft + ' lagi)';
                NumPlay.el('NM_feedback2').textContent = msg;
                NumPlay.el('NM_feedback2').className = 'fb-card ok';
                NumPlay.sfx('correct.wav');
                s.selected = [];
                this.renderGrid();

                if (s.pairsLeft <= 0) {
                    NumPlay.el('NM_feedback2').textContent = '\ud83c\udf89 Semua ketemu! Grid baru...';
                    setTimeout(function() { self.genGrid(); }, 800);
                }
            } else {
                s.streak = 0;
                NumPlay.el('NM_streak2').textContent = '0';
                NumPlay.el('NM_feedback2').textContent = '\u2716 ' + a + ' + ' + b + ' = ' + (a + b) + '  (bukan ' + s.target + ')';
                NumPlay.el('NM_feedback2').className = 'fb-card high';
                NumPlay.sfx('wrong.wav');
                s.selected = [];
                setTimeout(function() { self.renderGrid(); }, 500);
            }
        }
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        s.score = 0;
        s.streak = 0;
        s.timeLeft = 45;
        s.active = true;
        NumPlay.el('NM_score2').textContent = '0';
        NumPlay.el('NM_streak2').textContent = '0';
        NumPlay.el('NM_time2').textContent = '45';
        NumPlay.el('NM_time2').style.color = '#1a1a2e';
        NumPlay.el('NM_start2').style.display = 'none';
        NumPlay.el('NM_feedback2').textContent = 'Cari pasangan yang jumlahnya = target!';
        NumPlay.el('NM_feedback2').className = 'fb-card';

        this.startMusic();
        this.genGrid();

        var self = this;
        s.timer = setInterval(function() {
            s.timeLeft--;
            NumPlay.el('NM_time2').textContent = s.timeLeft;
            if (s.timeLeft <= 5) {
                NumPlay.el('NM_time2').style.color = '#dc2626';
                NumPlay.sfx('tick.wav');
            } else if (s.timeLeft <= 10) {
                NumPlay.el('NM_time2').style.color = '#f59e0b';
            }

            if (s.timeLeft <= 0) {
                clearInterval(s.timer);
                s.timer = null;
                self.stopMusic();
                NumPlay.sfx('end.wav');
                s.active = false;
                if (s.score > s.best) s.best = s.score;
                NumPlay.el('NM_best2').textContent = s.best;
                NumPlay.el('NM_feedback2').textContent = 'Waktu habis!';
                NumPlay.el('NM_feedback2').className = 'fb-card err';
                NumPlay.el('NM_start2').style.display = '';
                NumPlay.el('NM_start2').textContent = 'Main Lagi';
                NumPlay.showModal('\ud83c\udfaf', 'Waktu Habis!', s.score + ' poin', s.score >= s.best && s.score > 0 ? 'Skor baru!' : '', function() { self.reset(); });
            }
        }, 1000);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Cari pasangan yang jumlahnya = target') +
            '<div style="display:flex;justify-content:center;gap:20px;margin-bottom:10px">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#06b6d4" id="NM_time2">45</div><div class="nm-stat-lbl">DETIK</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="NM_score2">0</div><div class="nm-stat-lbl">POIN</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#f59e0b" id="NM_streak2">0</div><div class="nm-stat-lbl">STREAK</div></div>' +
            '</div>' +
            '<div class="nm-target-bar">' +
                '<div class="nm-target-item">TARGET</div>' +
                '<div class="nm-target-num" id="NM_target">?</div>' +
                '<div class="nm-target-item">Sisa: <b id="NM_pairs">0</b></div>' +
                '<div class="nm-target-item">Terbaik: <b id="NM_best2">0</b></div>' +
            '</div>' +
            '<div class="fb-card" id="NM_feedback2" style="font-size:13px;font-weight:700;margin-bottom:10px;padding:10px">Tekan Mulai!</div>' +
            '<div id="NM_grid" class="nm-grid"></div>' +
            '<button class="btn" id="NM_start2" onclick="NumPlay.games.match.start()" style="width:100%;font-size:16px;padding:16px;margin-top:10px;background:linear-gradient(135deg,#06b6d4,#0891b2);box-shadow:0 4px 16px rgba(6,182,212,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});