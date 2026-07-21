NumPlay.register({
    id: 'memory',
    name: 'Number Memory',
    icon: '\ud83e\udde0',
    desc: 'Lihat deret angka, hapus, ketik ulang! Makin panjang tiap level.',
    color: '#8b5cf6',
    bg: '#f5f3ff',

    state: {},

    playSound: function(f) { NumPlay.sfx(f); },

    reset: function() {
        var s = this.state;
        s.level = 1;
        s.best = s.best || 0;
        s.sequence = '';
        s.phase = 'ready';
        s.timer = null;
        NumPlay.el('NM_level').textContent = '1';
        NumPlay.el('NM_best').textContent = s.best;
        NumPlay.el('NM_display').textContent = '?';
        NumPlay.el('NM_display').style.color = '#6366f1';
        NumPlay.el('NM_feedback').textContent = 'Tekan Mulai!';
        NumPlay.el('NM_feedback').className = 'fb-card';
        NumPlay.el('NM_input').innerHTML = '';
        NumPlay.el('NM_start').style.display = '';
        NumPlay.el('NM_start').textContent = 'Mulai!';
    },

    genSequence: function(len) {
        var s = '';
        for (var i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
        return s;
    },

    getShowTime: function() {
        var s = this.state;
        if (s.level <= 3) return 2000;
        if (s.level <= 6) return 2500;
        if (s.level <= 10) return 3000;
        return 3500;
    },

    start: function() {
        var s = this.state;
        s.sequence = this.genSequence(s.level + 2);
        s.phase = 'show';
        NumPlay.el('NM_start').style.display = 'none';
        NumPlay.el('NM_feedback').textContent = 'Hafalkan!';
        NumPlay.el('NM_feedback').className = 'fb-card';
        NumPlay.el('NM_display').textContent = s.sequence;
        NumPlay.el('NM_display').style.color = '#1a1a2e';
        NumPlay.el('NM_input').innerHTML = '';

        var self = this;
        var showTime = this.getShowTime();
        s.timer = setTimeout(function() {
            s.phase = 'input';
            NumPlay.el('NM_display').textContent = '?'.repeat(s.sequence.length);
            NumPlay.el('NM_display').style.color = '#cbd5e1';
            NumPlay.el('NM_feedback').textContent = 'Ketik angkanya!';
            self.buildInput();
        }, showTime);
    },

    buildInput: function() {
        var s = this.state;
        var isMobile = window.innerWidth <= 560;
        if (isMobile) {
            var html = '<div class="vkb" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:280px;margin:0 auto">';
            for (var i = 0; i <= 9; i++) {
                html += '<button class="vkb-key" style="height:48px;font-size:18px" onclick="NumPlay.games.memory.press(' + i + ')">' + i + '</button>';
            }
            html += '</div>';
            html += '<div style="text-align:center;margin-top:10px">';
            html += '<button class="vkb-key del" style="display:inline-flex;width:auto;padding:0 24px;height:44px;font-size:14px;margin:4px" onclick="NumPlay.games.memory.del()">X</button>';
            html += '<button class="vkb-key action" style="display:inline-flex;width:auto;padding:0 24px;height:44px;font-size:14px;margin:4px" onclick="NumPlay.games.memory.check()">OK</button>';
            html += '</div>';
            NumPlay.el('NM_input').innerHTML = html;
        } else {
            NumPlay.el('NM_input').innerHTML =
                '<div class="input-bar">' +
                '<input type="text" inputmode="numeric" pattern="[0-9]*" class="field center" id="NM_field" placeholder="Ketik angka..." onkeypress="if(event.key===\'Enter\')NumPlay.games.memory.check()">' +
                '<button class="btn" onclick="NumPlay.games.memory.check()">OK</button>' +
                '</div>';
            setTimeout(function() { var f = document.getElementById('NM_field'); if(f) f.focus(); }, 100);
        }
    },

    press: function(d) {
        var s = this.state;
        if (s.phase !== 'input') return;
        var disp = NumPlay.el('NM_display');
        var cur = disp.textContent === '?'.repeat(s.sequence.length) ? '' : disp.textContent;
        if (cur.length >= s.sequence.length) return;
        cur += d;
        disp.textContent = cur;
        disp.style.color = '#6366f1';
        this.playSound('click.wav');
        var field = document.getElementById('NM_field');
        if (field) field.value = cur;
    },

    del: function() {
        var s = this.state;
        if (s.phase !== 'input') return;
        var disp = NumPlay.el('NM_display');
        var cur = disp.textContent;
        if (cur === '?'.repeat(s.sequence.length)) return;
        cur = cur.slice(0, -1);
        disp.textContent = cur.length === 0 ? '?'.repeat(s.sequence.length) : cur;
        if (cur.length === 0) disp.style.color = '#cbd5e1';
        var field = document.getElementById('NM_field');
        if (field) field.value = cur;
    },

    check: function() {
        var s = this.state;
        if (s.phase !== 'input') return;
        var disp = NumPlay.el('NM_display');
        var field = document.getElementById('NM_field');
        var cur = field ? field.value : disp.textContent;
        if (cur === '?'.repeat(s.sequence.length) || cur.length < s.sequence.length) return;

        if (cur === s.sequence) {
            s.phase = 'ready';
            this.playSound('correct.wav');
            NumPlay.el('NM_feedback').textContent = '\u2714 Benar!';
            NumPlay.el('NM_feedback').className = 'fb-card ok';
            NumPlay.el('NM_display').style.color = '#16a34a';
            s.level++;
            if (s.level > s.best) s.best = s.level;
            NumPlay.el('NM_level').textContent = s.level;
            NumPlay.el('NM_best').textContent = s.best;
            NumPlay.el('NM_input').innerHTML = '';
            NumPlay.el('NM_start').style.display = '';
            NumPlay.el('NM_start').textContent = 'Level ' + s.level;
        } else {
            s.phase = 'ready';
            this.playSound('wrong.wav');
            NumPlay.el('NM_feedback').textContent = '\u2716 Salah! Angkanya ' + s.sequence;
            NumPlay.el('NM_feedback').className = 'fb-card high';
            NumPlay.el('NM_display').textContent = s.sequence;
            NumPlay.el('NM_display').style.color = '#dc2626';
            NumPlay.el('NM_input').innerHTML = '';
            if (s.level > s.best) s.best = s.level;
            NumPlay.el('NM_best').textContent = s.best;
            NumPlay.el('NM_start').style.display = '';
            NumPlay.el('NM_start').textContent = 'Main Lagi';
            s.level = 1;
            NumPlay.el('NM_level').textContent = '1';
            NumPlay.showModal('\ud83e\udde0', 'Game Over', 'Capai level ' + s.best, '', function() { NumPlay.games.memory.reset(); });
        }
    },

    render: function() {
        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Lihat deret angka, hafalkan, ketik ulang!') +
            '<div style="display:flex;justify-content:center;gap:28px;margin-bottom:16px">' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#8b5cf6" id="NM_level">1</div><div style="font-size:10px;color:#94a3b8;font-weight:700">LEVEL</div></div>' +
                '<div style="text-align:center"><div style="font-size:42px;font-weight:800;color:#10b981" id="NM_best">0</div><div style="font-size:10px;color:#94a3b8;font-weight:700">TERBAIK</div></div>' +
            '</div>' +
            '<div class="fb-card" id="NM_feedback" style="font-size:15px;font-weight:700">Tekan Mulai!</div>' +
            '<div style="text-align:center;font-size:36px;font-weight:800;letter-spacing:8px;margin:18px 0;min-height:52px;word-break:break-all" id="NM_display">?</div>' +
            '<div id="NM_input"></div>' +
            '<button class="btn" id="NM_start" onclick="NumPlay.games.memory.start()" style="width:100%;font-size:16px;padding:16px">Mulai!</button>' +
            '</div>';

        this.reset();
    }
});