NumPlay.register({
    id: 'clear',
    name: 'Number Clear',
    icon: '\ud83d\uddd1\ufe0f',
    desc: 'Hapus angka yang sama yang berdampingan! Jangan sampai penuh!',
    color: '#10b981',
    bg: '#ecfdf5',

    state: {},

    cols: 6,
    rows: 8,

    reset: function() {
        if (this.state.timer) clearInterval(this.state.timer);
        var s = this.state;
        s.score = 0;
        s.best = s.best || 0;
        s.grid = [];
        s.active = false;
        s.timer = null;
        s.spawnRate = 3000;
        s.selected = null;
        for (var r = 0; r < this.rows; r++) {
            s.grid[r] = [];
            for (var c = 0; c < this.cols; c++) s.grid[r][c] = 0;
        }
        NumPlay.el('NC_score').textContent = '0';
        NumPlay.el('NC_best').textContent = s.best;
        NumPlay.el('NC_feedback').textContent = 'Tekan Mulai!';
        NumPlay.el('NC_feedback').className = 'fb-card';
        NumPlay.el('NC_grid').innerHTML = '';
        NumPlay.el('NC_start').style.display = '';
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
            s.grid[0][c] = Math.floor(Math.random() * 5) + 1;
        }
        this.renderGrid();
        return false;
    },

    renderGrid: function() {
        var s = this.state;
        var colors = ['', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        var html = '<div style="display:grid;grid-template-columns:repeat(' + this.cols + ',1fr);gap:4px;max-width:320px;margin:0 auto">';
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                var v = s.grid[r][c];
                var sel = s.selected && s.selected.r === r && s.selected.c === c;
                var style = '';
                if (v > 0) {
                    style = 'background:' + colors[v] + ';color:#fff;border-color:' + colors[v];
                }
                if (sel) style += ';box-shadow:0 0 0 3px #fff,0 0 0 5px ' + colors[v];
                html += '<button class="nc-cell" style="' + style + '" ontouchstart="" onclick="NumPlay.games.clear.tap(' + r + ',' + c + ')">' + (v > 0 ? v : '') + '</button>';
            }
        }
        html += '</div>';
        NumPlay.el('NC_grid').innerHTML = html;
    },

    findGroup: function(r, c, val, visited) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return [];
        if (visited[r + ',' + c]) return [];
        if (this.state.grid[r][c] !== val) return [];
        visited[r + ',' + c] = true;
        var group = [{r: r, c: c}];
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var i = 0; i < dirs.length; i++) {
            var nr = r + dirs[i][0], nc = c + dirs[i][1];
            group = group.concat(this.findGroup(nr, nc, val, visited));
        }
        return group;
    },

    tap: function(r, c) {
        var s = this.state;
        if (!s.active) return;
        var val = s.grid[r][c];
        if (val === 0) return;

        var visited = {};
        var group = this.findGroup(r, c, val, visited);

        if (group.length < 2) {
            NumPlay.el('NC_feedback').textContent = 'Butuh minimal 2 angka yang berdampingan!';
            NumPlay.el('NC_feedback').className = 'fb-card err';
            return;
        }

        var points = group.length * group.length * 5;
        s.score += points;
        NumPlay.el('NC_score').textContent = s.score;
        NumPlay.sfx('correct.wav');

        for (var i = 0; i < group.length; i++) {
            s.grid[group[i].r][group[i].c] = 0;
        }

        for (var c2 = 0; c2 < this.cols; c2++) {
            var writeRow = this.rows - 1;
            for (var r2 = this.rows - 1; r2 >= 0; r2--) {
                if (s.grid[r2][c2] !== 0) {
                    if (writeRow !== r2) {
                        s.grid[writeRow][c2] = s.grid[r2][c2];
                        s.grid[r2][c2] = 0;
                    }
                    writeRow--;
                }
            }
        }

        NumPlay.el('NC_feedback').textContent = '\u2714 Hapus ' + group.length + ' angka! +' + points + ' poin';
        NumPlay.el('NC_feedback').className = 'fb-card ok';
        this.renderGrid();
    },

    start: function() {
        var s = this.state;
        if (s.timer) clearInterval(s.timer);
        s.score = 0;
        s.active = true;
        s.spawnRate = 3000;
        s.grid = [];
        for (var r = 0; r < this.rows; r++) {
            s.grid[r] = [];
            for (var c = 0; c < this.cols; c++) s.grid[r][c] = 0;
        }

        for (var i = 0; i < 3; i++) this.spawnRow();

        NumPlay.el('NC_score').textContent = '0';
        NumPlay.el('NC_start').style.display = 'none';
        NumPlay.el('NC_feedback').textContent = 'Hapus angka yang sama yang berdampingan!';
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
            if (s.spawnRate > 1000) s.spawnRate -= 50;
        }, s.spawnRate);
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Hapus angka sama yang berdampingan!') +
            '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:12px">' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#10b981" id="NC_score">0</div><div class="nm-stat-lbl">POIN</div></div>' +
                '<div class="nm-stat"><div class="nm-stat-val" style="color:#6366f1" id="NC_best">0</div><div class="nm-stat-lbl">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="NC_feedback" style="font-size:13px;font-weight:700;margin-bottom:10px;padding:10px">Tekan Mulai!</div>' +
            '<div id="NC_grid"></div>' +
            '<button class="btn" id="NC_start" onclick="NumPlay.games.clear.start()" style="width:100%;font-size:16px;padding:16px;margin-top:12px;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 4px 16px rgba(16,185,129,0.3)">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});