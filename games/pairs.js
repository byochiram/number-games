NumPlay.register({
    id: 'pairs',
    name: 'Match Cards',
    icon: '\ud83c\udccf',
    desc: 'Lihat angka, balik kartu, cari pasangan! Uji ingatanmu!',
    color: '#d946ef',
    bg: '#fdf4ff',

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
            if (this.bgMusic) { this.bgMusic.pause(); this.bgMusic.currentTime = 0; this.bgMusic.src = ''; this.bgMusic.load(); this.bgMusic = null; }
        } catch(e) {}
    },

    reset: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        if (this.state.previewTimer) clearTimeout(this.state.previewTimer);
        this.stopMusic();
        var s = this.state;
        s.level = 1;
        s.best = s.best || 0;
        s.pairs = 0;
        s.totalPairs = 0;
        s.moves = 0;
        s.timeLeft = 0;
        s.active = false;
        s.timer = null;
        s.previewTimer = null;
        s.grid = [];
        s.flipped = [];
        s.matched = [];
        s.locked = false;
        NumPlay.el('PC_level').textContent = '1';
        NumPlay.el('PC_best').textContent = s.best;
        NumPlay.el('PC_time').textContent = '--';
        NumPlay.el('PC_moves').textContent = '0';
        NumPlay.el('PC_pairs').textContent = '0/0';
        NumPlay.el('PC_feedback').textContent = 'Tekan Mulai!';
        NumPlay.el('PC_feedback').className = 'fb-card';
        NumPlay.el('PC_grid').innerHTML = '';
        NumPlay.el('PC_start').style.display = '';
    },

    getGridSize: function() {
        var s = this.state;
        if (s.level <= 2) return { cols: 4, rows: 3, pairs: 6 };
        if (s.level <= 4) return { cols: 4, rows: 4, pairs: 8 };
        if (s.level <= 6) return { cols: 6, rows: 4, pairs: 12 };
        return { cols: 6, rows: 5, pairs: 15 };
    },

    getPreviewTime: function() {
        var s = this.state;
        if (s.level <= 2) return 3000;
        if (s.level <= 4) return 4000;
        if (s.level <= 6) return 5000;
        return 6000;
    },

    getTimeLimit: function() {
        var s = this.state;
        if (s.level <= 2) return 30;
        if (s.level <= 4) return 40;
        if (s.level <= 6) return 50;
        return 60;
    },

    genGrid: function() {
        var s = this.state;
        var cfg = this.getGridSize();
        s.totalPairs = cfg.pairs;

        var numbers = [];
        for (var i = 0; i < cfg.pairs; i++) {
            var num = Math.floor(Math.random() * 99) + 1;
            numbers.push(num, num);
        }

        for (var i = numbers.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = numbers[i]; numbers[i] = numbers[j]; numbers[j] = tmp;
        }

        s.grid = numbers;
        s.flipped = [];
        s.matched = [];
        s.pairs = 0;
        s.moves = 0;
        s.locked = false;
        NumPlay.el('PC_pairs').textContent = '0/' + cfg.pairs;
        NumPlay.el('PC_moves').textContent = '0';
    },

    renderGrid: function(showAll) {
        var s = this.state;
        var cfg = this.getGridSize();
        var html = '<div style="display:grid;grid-template-columns:repeat(' + cfg.cols + ',1fr);gap:8px;max-width:400px;margin:0 auto">';
        for (var i = 0; i < s.grid.length; i++) {
            var isFlipped = s.flipped.indexOf(i) !== -1;
            var isMatched = s.matched.indexOf(i) !== -1;
            var show = showAll || isFlipped || isMatched;
            var cls = 'pc-card';
            if (isMatched) cls += ' matched';
            else if (isFlipped) cls += ' flipped';
            html += '<button class="' + cls + '" ontouchstart="" onclick="NumPlay.games.pairs.flip(' + i + ')">';
            if (show) html += '<span class="pc-num">' + s.grid[i] + '</span>';
            else html += '<span class="pc-back">?</span>';
            html += '</button>';
        }
        html += '</div>';
        NumPlay.el('PC_grid').innerHTML = html;
    },

    flip: function(idx) {
        var s = this.state;
        if (!s.active || s.locked) return;
        if (s.matched.indexOf(idx) !== -1) return;
        if (s.flipped.indexOf(idx) !== -1) return;
        if (s.flipped.length >= 2) return;

        s.flipped.push(idx);
        NumPlay.sfx('click.wav');
        this.renderGrid(false);

        if (s.flipped.length === 2) {
            s.moves++;
            NumPlay.el('PC_moves').textContent = s.moves;
            var i0 = s.flipped[0], i1 = s.flipped[1];
            var v0 = s.grid[i0], v1 = s.grid[i1];
            var self = this;

            if (v0 === v1) {
                s.matched.push(i0, i1);
                s.pairs++;
                NumPlay.el('PC_pairs').textContent = s.pairs + '/' + s.totalPairs;
                NumPlay.el('PC_feedback').textContent = '\u2714 Cocok! ' + v0 + ' = ' + v1;
                NumPlay.el('PC_feedback').className = 'fb-card ok';
                NumPlay.sfx('correct.wav');
                s.flipped = [];

                if (s.pairs >= s.totalPairs) {
                    clearInterval(s.timer);
                    s.active = false;
                    if (s.level > s.best) s.best = s.level;
                    NumPlay.el('PC_best').textContent = s.best;
                    NumPlay.sfx('end.wav');
                    self.stopMusic();
                    setTimeout(function() {
                        s.level++;
                        NumPlay.el('PC_level').textContent = s.level;
                        NumPlay.el('PC_feedback').textContent = 'Level ' + s.level + '!';
                        NumPlay.el('PC_feedback').className = 'fb-card';
                        NumPlay.el('PC_start').style.display = '';
                        NumPlay.el('PC_start').textContent = 'Level ' + s.level;
                    }, 800);
                }
            } else {
                NumPlay.el('PC_feedback').textContent = '\u2716 ' + v0 + ' \u2260 ' + v1;
                NumPlay.el('PC_feedback').className = 'fb-card high';
                NumPlay.sfx('wrong.wav');
                s.locked = true;
                setTimeout(function() {
                    s.flipped = [];
                    s.locked = false;
                    self.renderGrid(false);
                }, 700);
            }
        }
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        if (s.previewTimer) clearTimeout(s.previewTimer);

        this.genGrid();
        var cfg = this.getGridSize();

        NumPlay.el('PC_start').style.display = 'none';
        NumPlay.el('PC_feedback').textContent = 'Hafalkan posisi angka!';
        NumPlay.el('PC_feedback').className = 'fb-card';

        this.renderGrid(true);

        var self = this;
        s.previewTimer = setTimeout(function() {
            self.renderGrid(false);
            NumPlay.el('PC_feedback').textContent = 'Cari pasangan!';
            NumPlay.el('PC_feedback').className = 'fb-card';

            self.startMusic();
            s.active = true;
            s.timeLeft = self.getTimeLimit();
            NumPlay.el('PC_time').textContent = s.timeLeft;

            s.timer = setInterval(function() {
                s.timeLeft--;
                NumPlay.el('PC_time').textContent = s.timeLeft;
                if (s.timeLeft <= 5) {
                    NumPlay.el('PC_time').style.color = '#dc2626';
                    NumPlay.sfx('tick.wav');
                } else if (s.timeLeft <= 10) {
                    NumPlay.el('PC_time').style.color = '#f59e0b';
                }

                if (s.timeLeft <= 0) {
                    clearInterval(s.timer);
                    s.timer = null;
                    s.active = false;
                    self.stopMusic();
                    NumPlay.sfx('end.wav');

                    var allMatched = [];
                    for (var i = 0; i < s.grid.length; i++) allMatched.push(i);
                    s.matched = allMatched;
                    self.renderGrid(false);

                    NumPlay.el('PC_feedback').textContent = 'Waktu habis!';
                    NumPlay.el('PC_feedback').className = 'fb-card err';
                    NumPlay.el('PC_start').style.display = '';
                    NumPlay.el('PC_start').textContent = 'Coba Lagi';
                    s.level = 1;
                    NumPlay.el('PC_level').textContent = '1';
                    NumPlay.showModal('\ud83c\udccf', 'Waktu Habis!', 'Capai level ' + s.best, '', function() { self.reset(); });
                }
            }, 1000);
        }, self.getPreviewTime());
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Lihat angka, balik kartu, cari pasangan!') +
            '<div style="display:flex;justify-content:center;gap:16px;margin-bottom:10px;flex-wrap:wrap">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#d946ef" id="PC_level">1</div><div class="nm-stat-lbl">LEVEL</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#ef4444" id="PC_time">--</div><div class="nm-stat-lbl">DETIK</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="PC_moves">0</div><div class="nm-stat-lbl">GERAKAN</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#10b981" id="PC_pairs">0/0</div><div class="nm-stat-lbl">PASANGAN</div></div>' +
            '</div>' +
            '<div style="text-align:center;margin-bottom:10px;font-size:12px;color:#94a3b8;font-weight:600">Terbaik: <b style="color:#10b981;font-size:16px" id="PC_best">0</b></div>' +
            '<div class="fb-card" id="PC_feedback" style="font-size:14px;font-weight:700;margin-bottom:12px;padding:10px">Tekan Mulai!</div>' +
            '<div id="PC_grid"></div>' +
            '<button class="btn" id="PC_start" onclick="NumPlay.games.pairs.start()" style="width:100%;font-size:16px;padding:16px;margin-top:12px;background:linear-gradient(135deg,#d946ef,#a855f7);box-shadow:0 4px 16px rgba(217,70,239,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});