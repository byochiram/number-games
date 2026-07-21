NumPlay.register({
    id: 'numberle',
    name: 'Numberle',
    icon: '\ud83d\udd22',
    desc: 'Tebak susunan angka seperti Wordle. Hijau benar, kuning salah posisi.',
    color: '#10b981',
    bg: '#e8f5e9',

    state: {},

    reset: function() {
        var s = this.state;
        if (!s.dig) s.dig = 5;
        s.secret = '';
        for (var i = 0; i < s.dig; i++) s.secret += Math.floor(Math.random() * 10);
        s.guesses = [];
        s.current = '';
        s.over = false;
        NumPlay.el('N_msg').textContent = '';
        NumPlay.el('N_msg_box').className = 'fb-card';
        this.renderBoard();
        this.focusInput();
    },

    setDiff: function(i, el) {
        this.state.dig = i + 5;
        NumPlay.setActivePill(el);
        this.reset();
    },

    focusInput: function() {
        var inp = document.getElementById('N_hid');
        if (inp) inp.focus();
    },

    renderBoard: function() {
        var s = this.state;
        var board = NumPlay.el('N_board');
        board.innerHTML = '';

        for (var r = 0; r < 6; r++) {
            var row = document.createElement('div');
            row.className = 'brow';
            for (var c = 0; c < s.dig; c++) {
                var cell = document.createElement('div');
                cell.className = 'bc';
                if (r < s.guesses.length && s.guesses[r]) {
                    cell.textContent = s.guesses[r][c].d;
                    cell.classList.add(s.guesses[r][c].s);
                } else if (r === s.guesses.length) {
                    cell.classList.add('cur');
                    if (s.current[c]) {
                        cell.textContent = s.current[c];
                        cell.classList.add('filled');
                    }
                }
                row.appendChild(cell);
            }
            board.appendChild(row);
        }

        if (!document.getElementById('N_hid')) {
            var self = this;
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.id = 'N_hid';
            inp.className = 'hidden';
            inp.autocomplete = 'off';
            inp.inputMode = 'numeric';
            inp.pattern = '[0-9]*';
            inp.maxLength = s.dig;
            inp.addEventListener('input', function() {
                if (s.over) return;
                var v = this.value.replace(/[^0-9]/g, '');
                if (v.length > s.dig) v = v.substring(0, s.dig);
                s.current = v;
                this.value = v;
                self.renderBoard();
            });
            inp.addEventListener('keydown', function(e) {
                if (s.over) return;
                if (e.key === 'Enter') { e.preventDefault(); self.submit(); }
                else if (e.key === 'Backspace') {
                    setTimeout(function() {
                        s.current = document.getElementById('N_hid').value.replace(/[^0-9]/g, '');
                        self.renderBoard();
                    }, 0);
                }
            });
            document.body.appendChild(inp);
        }

        var self = this;
        if (!NumPlay.el('app')._nbound) {
            NumPlay.el('app').addEventListener('click', function() {
                if (NumPlay.currentGame === 'numberle' && !self.state.over) self.focusInput();
            });
            NumPlay.el('app')._nbound = true;
        }
        this.focusInput();
    },

    submit: function() {
        var s = this.state;
        if (s.over || s.current.length !== s.dig) return;

        var result = [];
        var used = [];
        for (var i = 0; i < s.dig; i++) used[i] = false;

        for (var i = 0; i < s.dig; i++) {
            if (s.current[i] === s.secret[i]) {
                result[i] = { d: s.current[i], s: 'g' };
                used[i] = true;
            } else {
                result[i] = { d: s.current[i], s: 'x' };
            }
        }

        for (var i = 0; i < s.dig; i++) {
            if (result[i].s === 'g') continue;
            for (var j = 0; j < s.dig; j++) {
                if (!used[j] && s.current[i] === s.secret[j]) {
                    result[i].s = 'y';
                    used[j] = true;
                    break;
                }
            }
        }

        s.guesses.push(result);
        s.current = '';
        document.getElementById('N_hid').value = '';
        this.renderBoard();

        var allGreen = true;
        for (var i = 0; i < result.length; i++) {
            if (result[i].s !== 'g') { allGreen = false; break; }
        }

        if (allGreen) {
            s.over = true;
            NumPlay.el('N_msg').textContent = '\u2714 ' + s.secret;
            NumPlay.el('N_msg_box').className = 'fb-card ok';
            NumPlay.showModal('\ud83c\udfc6', 'Benar!', 'Angkanya ' + s.secret, s.guesses.length + ' percobaan', this.reset.bind(this));
        } else if (s.guesses.length >= 6) {
            s.over = true;
            NumPlay.el('N_msg').textContent = 'Angkanya ' + s.secret;
            NumPlay.el('N_msg_box').className = 'fb-card high';
            NumPlay.showModal('\u274c', 'Habis!', 'Angkanya ' + s.secret, '', this.reset.bind(this));
        } else {
            this.focusInput();
        }
    },

    render: function() {
        var s = this.state;
        if (!s.dig) s.dig = 5;

        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Tebak susunan angka seperti Wordle') +
            NumPlay.pills(['5 digit', '6 digit', '7 digit'], s.dig - 5, 'NumPlay.games.numberle.setDiff') +
            '<div class="leg">' +
                '<div class="leg-i"><div class="leg-d" style="background:#22c55e"></div>Posisi benar</div>' +
                '<div class="leg-i"><div class="leg-d" style="background:#eab308"></div>Salah posisi</div>' +
                '<div class="leg-i"><div class="leg-d" style="background:#94a3b8"></div>Tidak ada</div>' +
            '</div>' +
            '<div class="board" id="N_board"></div>' +
            '<div class="fb-card" id="N_msg_box"><div class="l1" id="N_msg"></div></div>' +
            '<button class="btn" onclick="NumPlay.games.numberle.reset()" style="width:100%">Mulai Lagi</button>' +
            '</div>';

        this.reset();
    }
});