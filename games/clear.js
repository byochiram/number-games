NumPlay.register({
    id: 'clear',
    name: 'Number Clear',
    icon: '\ud83d\uddd1\ufe0f',
    desc: 'Klik angka sama yang berdampingan untuk hapus! Jangan sampai penuh!',
    color: '#10b981',
    bg: '#ecfdf5',

    state: {},
    cols: 6,
    rows: 7,

    reset: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        var s = this.state;
        s.score = 0;
        s.best = s.best || 0;
        s.grid = [];
        s.active = false;
        s.timer = null;
        s.spawnRate = 4000;
        s.highlight = [];
        for (var r = 0; r < this.rows; r++) {
            s.grid[r] = [];
            for (var c = 0; c < this.cols; c++) s.grid[r][c] = 0;
        }
        NumPlay.el('NC_score').textContent = '0';
        NumPlay.el('NC_best').textContent = s.best;
        NumPlay.el('NC_feedback').innerHTML = '<b>Klik angka yang sama dan berdampingan</b> untuk hapus. Minimal 2 angka!';
        NumPlay.el('NC_feedback').className = 'fb-card';
        NumPlay.el('NC_grid').innerHTML = '';
        NumPlay.el('NC_start').style.display = '';
        NumPlay.el('NC_how').style.display = '';
    },

    spawnRow: function() {
        var s = this.state;
        for (var c = 0; c < this.cols; c++) {
            if (s.grid[0][c] !== 0) return true;
        }
        for (var r = this.rows - 1; r > 0; r--) {
            for (var c = 0; c < this.cols; c++) s.grid[r][c] = s.grid[r-1][c];
        }
        for (var c = 0; c < this.cols; c++) {
            s.grid[0][c] = Math.floor(Math.random() * 4) + 1;
        }
        this.renderGrid();
        return false;
    },

    findGroup: function(r, c, val, visited) {
        var key = r + ',' + c;
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return [];
        if (visited[key]) return [];
        if (this.state.grid[r][c] !== val) return [];
        visited[key] = true;
        var group = [{r: r, c: c}];
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < dirs.length; i++) {
            group = group.concat(this.findGroup(r + dirs[i][0], c + dirs[i][1], val, visited));
        }
        return group;
    },

    highlightGroup: function(r, c) {
        var s = this.state;
        var val = s.grid[r][c];
        if (val === 0) { s.highlight = []; this.renderGrid(); return; }
        s.highlight = this.findGroup(r, c, val, {});
        this.renderGrid();
    },

    renderGrid: function() {
        var s = this.state;
        var colors = ['', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
        var html = '<div style="display:grid;grid-template-columns:repeat(' + this.cols + ',1fr);gap:5px;max-width:340px;margin:0 auto">';
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                var v = s.grid[r][c];
                var isHl = false;
                for (var h = 0; h < s.highlight.length; h++) {
                    if (s.highlight[h].r === r && s.highlight[h].c === c) { isHl = true; break; }
                }
                var style = '';
                if (v > 0) {
                    style = 'background:' + colors[v] + ';color:#fff;border-color:' + colors[v];
                    if (isHl && s.highlight.length >= 2) {
                        style += ';box-shadow:0 0 12px ' + colors[v] + ';transform:scale(1.08);border-color:#fff';
                    } else if (isHl && s.highlight.length < 2) {
                        style += ';opacity:0.5';
                    }
                }
                html += '<button class="nc-cell" style="' + style + '" ontouchstart="" ' +
                    'onmouseenter="NumPlay.games.clear.highlightGroup(' + r + ',' + c + ')" ' +
                    'onclick="NumPlay.games.clear.tap(' + r + ',' + c + ')">' +
                    (v > 0 ? v : '') + '</button>';
            }
        }
        html += '</div>';
        NumPlay.el('NC_grid').innerHTML = html;
    },

    tap: function(r, c) {
        var s = this.state;
        if (!s.active) return;
        var val = s.grid[r][c];
        if (val === 0) return;

        var group = this.findGroup(r, c, val, {});

        if (group.length < 2) {
            NumPlay.sfx('wrong.wav');
            NumPlay.el('NC_feedback').textContent = 'Cuma 1 angka! Butuh minimal 2 yang berdampingan.';
            NumPlay.el('NC_feedback').className = 'fb-card err';
            return;
        }

        var points = group.length * group.length * 10;
        s.score += points;
        NumPlay.el('NC_score').textContent = s.score;
        NumPlay.sfx('correct.wav');

        for (var i = 0; i < group.length; i++) {
            s.grid[group[i].r][group[i].c] = 0;
        }

        for (var c2 = 0; c2 < this.cols; c2++) {
            var write = this.rows - 1;
            for (var r2 = this.rows - 1; r2 >= 0; r2--) {
                if (s.grid[r2][c2] !== 0) {
                    if (write !== r2) { s.grid[write][c2] = s.grid[r2][c2]; s.grid[r2][c2] = 0; }
                    write--;
                }
            }
        }

        s.highlight = [];
        var bonus = group.length > 3 ? ' \ud83d\udd25' : '';
        NumPlay.el('NC_feedback').textContent = '\u2714 Hapus ' + group.length + ' angka! +' + points + ' poin' + bonus;
        NumPlay.el('NC_feedback').className = 'fb-card ok';
        this.renderGrid();
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        s.score = 0;
        s.active = true;
        s.spawnRate = 4000;
        s.highlight = [];
        s.grid = [];
        for (var r = 0; r < this.rows; r++) {
            s.grid[r] = [];
            for (var c = 0; c < this.cols; c++) s.grid[r][c] = 0;
        }
        for (var i = 0; i < 4; i++) this.spawnRow();

        NumPlay.el('NC_score').textContent = '0';
        NumPlay.el('NC_start').style.display = 'none';
        NumPlay.el('NC_how').style.display = 'none';
        NumPlay.el('NC_feedback').textContent = 'Klik angka sama yang berdampingan!';
        NumPlay.el('NC_feedback').className = 'fb-card';
        this.renderGrid();

        var self = this;
        s.timer = setInterval(function() {
            var full = self.spawnRow();
            if (full) {
                clearInterval(s.timer);
                s.timer = null;
                s.active = false;
                if (s.score > s.best) s.best = s.score;
                NumPlay.el('NC_best').textContent = s.best;
                NumPlay.el('NC_feedback').textContent = 'Grid penuh!';
                NumPlay.el('NC_feedback').className = 'fb-card err';
                NumPlay.sfx('end.wav');
                NumPlay.el('NC_start').style.display = '';
                NumPlay.el('NC_start').textContent = 'Main Lagi';
                NumPlay.showModal('\ud83d\uddd1\ufe0f', 'Game Over!', s.score + ' poin', s.score >= s.best && s.score > 0 ? 'Skor baru!' : '', function() { self.reset(); });
            }
            if (s.spawnRate > 1500) s.spawnRate -= 30;
        }, s.spawnRate);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Klik angka sama yang berdampingan untuk hapus') +
            '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:12px">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#10b981" id="NC_score">0</div><div class="nm-stat-lbl">POIN</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="NC_best">0</div><div class="nm-stat-lbl">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="NC_feedback" style="font-size:13px;font-weight:700;margin-bottom:10px;padding:12px"><b>Klik angka yang sama dan berdampingan</b> untuk hapus. Minimal 2!</div>' +
            '<div id="NC_how" style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:12px;padding:12px;margin-bottom:12px;font-size:12px;color:#065f46;line-height:1.6">' +
                '<b>Cara Main:</b><br>' +
                '\u2022 Angka 1-4 muncul dari atas ke bawah<br>' +
                '\u2022 <b>Klik angka</b> yang sama dan <b>berdampingan</b> (atas/bawah/kiri/kanan)<br>' +
                '\u2022 Minimal <b>2 angka</b> terhubung baru bisa hapus<br>' +
                '\u2022 Grup besar = poin besar (2=40, 3=90, 4=160)<br>' +
                '\u2022 Baru terus naik dari atas, makin lama makin cepat<br>' +
                '\u2022 Grid penuh = game over!' +
            '</div>' +
            '<div id="NC_grid"></div>' +
            '<button class="btn" id="NC_start" onclick="NumPlay.games.clear.start()" style="width:100%;font-size:16px;padding:16px;margin-top:12px;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 16px rgba(16,185,129,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});