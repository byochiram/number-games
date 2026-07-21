NumPlay.register({
    id: 'sudoku',
    name: 'Sudoku',
    icon: '\ud83d\udd22',
    desc: 'Isi grid dengan angka 1-9 tanpa duplikat di baris, kolom, dan kotak!',
    color: '#6366f1',
    bg: '#eef2ff',

    state: {},

    reset: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        var s = this.state;
        s.size = s.size || 4;
        s.puzzle = [];
        s.solution = [];
        s.user = [];
        s.selected = null;
        s.active = false;
        s.timer = null;
        s.timeLeft = 0;
        s.best = s.best || {};
        NumPlay.el('SD_time').textContent = '0:00';
        NumPlay.el('SD_best').textContent = s.best[s.size] ? this.fmtTime(s.best[s.size]) : '--';
        NumPlay.el('SD_feedback').textContent = 'Pilih ukuran lalu Mulai!';
        NumPlay.el('SD_feedback').className = 'fb-card';
        NumPlay.el('SD_grid').innerHTML = '';
        NumPlay.el('SD_numpad').innerHTML = '';
        NumPlay.el('SD_start').style.display = '';
    },

    fmtTime: function(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    },

    setSize: function(sz, el) {
        this.state.size = sz;
        document.querySelectorAll('.pill').forEach(function(b) { b.classList.remove('on'); });
        el.classList.add('on');
        this.reset();
    },

    generate: function(size) {
        var boxR, boxC;
        if (size === 4) { boxR = 2; boxC = 2; }
        else if (size === 6) { boxR = 2; boxC = 3; }
        else { boxR = 3; boxC = 3; }

        var grid = [];
        for (var r = 0; r < size; r++) {
            grid[r] = [];
            for (var c = 0; c < size; c++) grid[r][c] = 0;
        }

        function isValid(g, r, c, n) {
            for (var i = 0; i < size; i++) {
                if (g[r][i] === n) return false;
                if (g[i][c] === n) return false;
            }
            var br = Math.floor(r / boxR) * boxR;
            var bc = Math.floor(c / boxC) * boxC;
            for (var dr = 0; dr < boxR; dr++) {
                for (var dc = 0; dc < boxC; dc++) {
                    if (g[br + dr][bc + dc] === n) return false;
                }
            }
            return true;
        }

        function solve(g) {
            for (var r = 0; r < size; r++) {
                for (var c = 0; c < size; c++) {
                    if (g[r][c] === 0) {
                        var nums = [];
                        for (var n = 1; n <= size; n++) nums.push(n);
                        for (var i = nums.length - 1; i > 0; i--) {
                            var j = Math.floor(Math.random() * (i + 1));
                            var tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
                        }
                        for (var i = 0; i < nums.length; i++) {
                            if (isValid(g, r, c, nums[i])) {
                                g[r][c] = nums[i];
                                if (solve(g)) return true;
                                g[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }

        solve(grid);

        var solution = [];
        for (var r = 0; r < size; r++) {
            solution[r] = [];
            for (var c = 0; c < size; c++) solution[r][c] = grid[r][c];
        }

        var clues;
        if (size === 4) clues = 6;
        else if (size === 6) clues = 12;
        else clues = 28;

        var positions = [];
        for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) positions.push([r, c]);
        for (var i = positions.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = positions[i]; positions[i] = positions[j]; positions[j] = tmp;
        }

        var puzzle = [];
        for (var r = 0; r < size; r++) {
            puzzle[r] = [];
            for (var c = 0; c < size; c++) puzzle[r][c] = 0;
        }
        for (var i = 0; i < clues; i++) {
            puzzle[positions[i][0]][positions[i][1]] = solution[positions[i][0]][positions[i][1]];
        }

        return { puzzle: puzzle, solution: solution };
    },

    renderGrid: function() {
        var s = this.state;
        var size = s.size;
        var boxR, boxC;
        if (size === 4) { boxR = 2; boxC = 2; }
        else if (size === 6) { boxR = 2; boxC = 3; }
        else { boxR = 3; boxC = 3; }

        var cellSize = size <= 4 ? 60 : size <= 6 ? 50 : 42;
        var html = '<div style="display:inline-grid;grid-template-columns:repeat(' + size + ',' + cellSize + 'px);gap:2px;margin:0 auto;border:3px solid #1a1a2e;border-radius:10px;padding:3px;background:#1a1a2e">';
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                var v = s.user[r][c];
                var isGiven = s.puzzle[r][c] !== 0;
                var isSel = s.selected && s.selected.r === r && s.selected.c === c;
                var isConflict = false;

                if (!isGiven && v !== 0) {
                    for (var i = 0; i < size; i++) {
                        if (i !== c && s.user[r][i] === v) isConflict = true;
                        if (i !== r && s.user[i][c] === v) isConflict = true;
                    }
                    var br = Math.floor(r / boxR) * boxR;
                    var bc = Math.floor(c / boxC) * boxC;
                    for (var dr = 0; dr < boxR; dr++) {
                        for (var dc = 0; dc < boxC; dc++) {
                            if ((br+dr !== r || bc+dc !== c) && s.user[br+dr][bc+dc] === v) isConflict = true;
                        }
                    }
                }

                var borderRight = (c + 1) % boxC === 0 && c < size - 1 ? 'border-right:2px solid #6366f1;' : '';
                var borderBottom = (r + 1) % boxR === 0 && r < size - 1 ? 'border-bottom:2px solid #6366f1;' : '';

                var bg = '#fff';
                var color = '#1a1a2e';
                if (isGiven) { bg = '#f1f5f9'; color = '#1a1a2e'; }
                if (isSel) { bg = '#e0e7ff'; }
                if (isConflict) { color = '#ef4444'; bg = '#fef2f2'; }

                html += '<button style="width:' + cellSize + 'px;height:' + cellSize + 'px;border:none;background:' + bg + ';color:' + color + ';font-size:' + (size <= 6 ? 22 : 18) + 'px;font-weight:' + (isGiven ? '800' : '600') + ';cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;border-radius:4px;' + borderRight + borderBottom + '" ' +
                    'onclick="NumPlay.games.sudoku.select(' + r + ',' + c + ')" ontouchstart="">' +
                    (v !== 0 ? v : '') + '</button>';
            }
        }
        html += '</div>';
        NumPlay.el('SD_grid').innerHTML = html;
    },

    renderNumpad: function() {
        var s = this.state;
        var size = s.size;
        var html = '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:12px">';
        for (var n = 1; n <= size; n++) {
            html += '<button class="vkb-key" style="width:44px;height:44px;font-size:18px;border-radius:10px" onclick="NumPlay.games.sudoku.input(' + n + ')">' + n + '</button>';
        }
        html += '<button class="vkb-key del" style="width:44px;height:44px;font-size:16px;border-radius:10px" onclick="NumPlay.games.sudoku.input(0)">X</button>';
        html += '</div>';
        NumPlay.el('SD_numpad').innerHTML = html;
    },

    select: function(r, c) {
        var s = this.state;
        if (!s.active) return;
        if (s.puzzle[r][c] !== 0) return;
        s.selected = { r: r, c: c };
        NumPlay.sfx('click.wav');
        this.renderGrid();
    },

    input: function(n) {
        var s = this.state;
        if (!s.active || !s.selected) return;
        var r = s.selected.r, c = s.selected.c;
        if (s.puzzle[r][c] !== 0) return;
        s.user[r][c] = n;
        NumPlay.sfx('click.wav');
        this.renderGrid();
        this.checkWin();
    },

    checkWin: function() {
        var s = this.state;
        var size = s.size;
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (s.user[r][c] !== s.solution[r][c]) return;
            }
        }

        clearInterval(s.timer);
        s.active = false;
        NumPlay.sfx('correct.wav');
        NumPlay.el('SD_feedback').textContent = '\u2714 Selesai! Waktu: ' + this.fmtTime(s.timeLeft);
        NumPlay.el('SD_feedback').className = 'fb-card ok';
        NumPlay.el('SD_start').style.display = '';
        NumPlay.el('SD_start').textContent = 'Main Lagi';
        if (!s.best[s.size] || s.timeLeft < s.best[s.size]) {
            s.best[s.size] = s.timeLeft;
            NumPlay.el('SD_best').textContent = this.fmtTime(s.timeLeft);
        }
        NumPlay.showModal('\ud83d\udd22', 'Selesai!', 'Waktu: ' + this.fmtTime(s.timeLeft), s.best[s.size] === s.timeLeft ? 'Skor baru!' : '', function() { NumPlay.games.sudoku.reset(); });
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        var data = this.generate(s.size);
        s.puzzle = data.puzzle;
        s.solution = data.solution;
        s.user = [];
        for (var r = 0; r < s.size; r++) {
            s.user[r] = [];
            for (var c = 0; c < s.size; c++) s.user[r][c] = s.puzzle[r][c];
        }
        s.selected = null;
        s.active = true;
        s.timeLeft = 0;
        NumPlay.el('SD_start').style.display = 'none';
        NumPlay.el('SD_feedback').textContent = 'Isi kotak kosong!';
        NumPlay.el('SD_feedback').className = 'fb-card';
        this.renderGrid();
        this.renderNumpad();

        var self = this;
        s.timer = setInterval(function() {
            s.timeLeft++;
            NumPlay.el('SD_time').textContent = self.fmtTime(s.timeLeft);
        }, 1000);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Isi grid tanpa duplikat di baris, kolom, dan kotak') +
            '<div class="pill-row" style="justify-content:center">' +
                '<button class="pill on" onclick="NumPlay.games.sudoku.setSize(4,this)">4x4</button>' +
                '<button class="pill" onclick="NumPlay.games.sudoku.setSize(6,this)">6x6</button>' +
                '<button class="pill" onclick="NumPlay.games.sudoku.setSize(9,this)">9x9</button>' +
            '</div>' +
            '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:12px">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="SD_time">0:00</div><div class="nm-stat-lbl">WAKTU</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#10b981" id="SD_best">--</div><div class="nm-stat-lbl">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="SD_feedback" style="font-size:13px;font-weight:700;margin-bottom:12px;padding:10px">Pilih ukuran lalu Mulai!</div>' +
            '<div style="text-align:center" id="SD_grid"></div>' +
            '<div id="SD_numpad"></div>' +
            '<button class="btn" id="SD_start" onclick="NumPlay.games.sudoku.start()" style="width:100%;font-size:16px;padding:16px;margin-top:14px;background:linear-gradient(135deg,#6366f1,#4f46e5);box-shadow:0 4px 16px rgba(99,102,241,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});