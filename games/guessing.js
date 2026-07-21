NumPlay.register({
    id: 'guessing',
    name: 'Number Guessing',
    icon: '\ud83c\udfaf',
    desc: 'Tebak angka rahasia. Range mengecil tiap tebakan. Dapat hint tinggi/rendah/close.',
    color: '#f97316',
    bg: '#fff3e0',

    state: {},

    reset: function() {
        var s = this.state;
        s.target = Math.floor(Math.random() * s.max) + 1;
        s.attempts = 0;
        s.prevDist = -1;
        s.lo = 1;
        s.hi = s.max;
        s.best = s.best || {};
        NumPlay.el('G_lo').textContent = 1;
        NumPlay.el('G_hi').textContent = s.max;
        NumPlay.el('G_att').textContent = '0';
        NumPlay.el('G_l1').textContent = '';
        NumPlay.el('G_l2').textContent = '';
        NumPlay.el('G_fb').className = 'fb-card';
        NumPlay.el('G_chips').innerHTML = '';
        NumPlay.el('G_best').textContent = s.best[s.max] || '-';
        NumPlay.el('G_inp').value = '';
        NumPlay.el('G_display').textContent = '?';
    },

    setDiff: function(i, el) {
        this.state.max = [50, 100, 1000, 10000][i];
        NumPlay.setActivePill(el);
        this.reset();
    },

    guess: function() {
        var s = this.state;
        var inp = NumPlay.el('G_inp');
        var display = NumPlay.el('G_display');
        var g = parseInt(inp.value);

        if (isNaN(g) || g < s.lo || g > s.hi) {
            this.showFB('Masukkan ' + s.lo + '\u2013' + s.hi, '', 'err');
            inp.value = '';
            display.textContent = '?';
            return;
        }

        s.attempts++;
        NumPlay.el('G_att').textContent = s.attempts;

        var dist = Math.abs(g - s.target);
        var threshold = s.max <= 50 ? 3 : s.max <= 100 ? 5 : s.max <= 1000 ? 30 : 200;

        if (g === s.target) {
            this.showFB('\u2714 Benar! Angkanya ' + s.target + '!', s.attempts + ' percobaan', 'ok');
            NumPlay.el('G_chips').innerHTML += '<span class="chip ok">' + g + '</span>';
            s.hi = s.target; s.lo = s.target;
            NumPlay.el('G_lo').textContent = s.lo;
            NumPlay.el('G_hi').textContent = s.hi;
            if (!s.best[s.max] || s.attempts < s.best[s.max]) s.best[s.max] = s.attempts;
            NumPlay.showModal('\ud83c\udfc6', 'Menang!', 'Angkanya ' + s.target, s.attempts + ' percobaan', this.reset.bind(this));
            return;
        }

        var line1, type;
        if (g > s.target) {
            line1 = g + ' \u2191 Terlalu tinggi';
            type = 'high';
            s.hi = g - 1;
        } else {
            line1 = g + ' \u2193 Terlalu rendah';
            type = 'low';
            s.lo = g + 1;
        }
        NumPlay.el('G_lo').textContent = s.lo;
        NumPlay.el('G_hi').textContent = s.hi;

        var line2 = '';
        if (dist <= threshold) line2 = '\ud83d\udd25 Close!';
        else if (s.prevDist !== -1 && dist < s.prevDist) line2 = '\u2705 Mendekati!';
        else if (s.prevDist !== -1 && dist > s.prevDist) line2 = '\u274c Menjauh!';

        this.showFB(line1, line2, type);
        NumPlay.el('G_chips').innerHTML += '<span class="chip ' + type + '">' + g + '</span>';
        s.prevDist = dist;
        inp.value = '';
        display.textContent = '?';
    },

    showFB: function(l1, l2, type) {
        NumPlay.el('G_l1').textContent = l1;
        var e = NumPlay.el('G_l2');
        e.textContent = l2;
        e.className = 'l2';
        if (l2.indexOf('Close') !== -1) e.classList.add('clo');
        else if (l2.indexOf('Mendekati') !== -1) e.classList.add('near');
        else if (l2.indexOf('Menjauh') !== -1) e.classList.add('far');
        NumPlay.el('G_fb').className = 'fb-card ' + type;
    },

    render: function() {
        var s = this.state;
        if (!s.max) s.max = 50;

        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Tebak angka, range mengecil setiap tebakan') +
            NumPlay.pills(['1\u201350', '1\u2013100', '1\u20131K', '1\u201310K'], [50, 100, 1000, 10000].indexOf(s.max), 'NumPlay.games.guessing.setDiff') +
            '<div class="range-bar">' +
                '<div class="range-box" id="G_lo">1</div>' +
                '<div class="range-dot"></div>' +
                '<div class="range-box" id="G_hi">' + s.max + '</div>' +
            '</div>' +
            '<div class="fb-card" id="G_display" style="font-size:32px;font-weight:800;min-height:56px;color:#6366f1;letter-spacing:4px;background:#f8fafc;border:2px solid #e2e8f0">?</div>' +
            '<input type="text" inputmode="none" id="G_inp">' +
            NumPlay.vkb('G_inp', 'NumPlay.games.guessing.guess()') +
            '<div class="fb-card" id="G_fb"><div class="l1" id="G_l1"></div><div class="l2" id="G_l2"></div></div>' +
            '<div class="chips" id="G_chips"></div>' +
            '<div class="stats-bar">' +
                '<div class="st"><div class="v" id="G_att">0</div><div class="l">Tebakan</div></div>' +
                '<div class="st"><div class="v" id="G_best">-</div><div class="l">Terbaik</div></div>' +
            '</div>' +
            '</div>';

        this.reset();
    }
});