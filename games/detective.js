NumPlay.register({
    id: 'detective',
    name: 'Number Detective',
    icon: '\ud83d\udd0d',
    desc: 'Kamu nanya Ya/Tidak, komputer jawab. Cari angka dengan logika!',
    color: '#3b82f6',
    bg: '#e3f2fd',

    state: {},

    lev: function(a, b) {
        var m = a.length, n = b.length, dp = [];
        for (var i = 0; i <= m; i++) { dp[i] = [i]; }
        for (var j = 0; j <= n; j++) { dp[0][j] = j; }
        for (var i = 1; i <= m; i++) for (var j = 1; j <= n; j++) {
            var c = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + c);
        }
        return dp[m][n];
    },

    dict: [
        ['genap','genap'],['even','genap'],['gnp','genap'],
        ['ganjil','ganjil'],['odd','ganjil'],['gnjl','ganjil'],
        ['prima','prima'],['prime','prima'],['prm','prima'],
        ['kuadrat','kuadrat'],['square','kuadrat'],['kudrat','kuadrat'],
        ['kubik','kubik'],['cube','kubik'],
        ['kelipatan','kelipatan'],['klipatan','kelipatan'],['klptn','kelipatan'],['klp','kelipatan'],['multiple','kelipatan'],
        ['lebih','lebih'],['lbh','lebih'],['besar','lebih'],['bsr','lebih'],
        ['kurang','kurang'],['krng','kurang'],['kecil','kurang'],['kcl','kurang'],
        ['antara','antara'],['antra','antara'],['between','antara'],
        ['dibagi','dibagi'],['dbagi','dibagi'],['bagi','dibagi'],
        ['habis','habis'],['hbs','habis'],
        ['atas','atas'],['diatas','atas'],['bawah','bawah'],['dibawah','bawah'],
        ['melebihi','lebih'],['melampaui','lebih'],
        ['sempurna','sempurna'],['perfect','sempurna'],
        ['sisa','sisa'],['jumlah','jumlah'],['digit','digit'],['angka','angka']
    ],

    fixWord: function(w) {
        if (/^\d+$/.test(w)) return w;
        for (var i = 0; i < this.dict.length; i++) if (w === this.dict[i][0]) return this.dict[i][1];
        for (var i = 0; i < this.dict.length; i++) if (w.length >= 3 && this.dict[i][0].indexOf(w) === 0) return this.dict[i][1];
        var best = null, bd = 3;
        for (var i = 0; i < this.dict.length; i++) {
            var d = this.lev(w, this.dict[i][0]);
            if (d < bd) { bd = d; best = this.dict[i][1]; }
        }
        return best || w;
    },

    normalize: function(q) {
        q = q.replace(/^(apakah|apa|adakah)\s+(angkanya|angka|bilangannya|nomornya|nomor)?\s*/i, '');
        q = q.replace(/[^a-z0-9\s]/g, ' ');
        q = q.replace(/\s+/g, ' ').trim();
        var words = q.split(' '), fixed = [];
        for (var i = 0; i < words.length; i++) fixed.push(this.fixWord(words[i]));
        return fixed.join(' ');
    },

    detectType: function(q) {
        if (/(^|\s)(lebih|besar|di\s*atas|diatas|melebihi|melampaui)(\s|$)/.test(q)) return 'more';
        if (/(^|\s)(kurang|kecil|di\s*bawah|dibawah)(\s|$)/.test(q)) return 'less';
        if (/(^|\s)(kelipatan|dibagi|habis\s*dibagi|bagi|kali|mod)(\s|$|\d)/.test(q)) return 'div';
        if (/(^|\s)(antara|between)(\s|$)/.test(q)) return 'between';
        if (/(^|\s)(genap|even)(\s|$)/.test(q)) return 'even';
        if (/(^|\s)(ganjil|odd)(\s|$)/.test(q)) return 'odd';
        if (/(^|\s)(prima|prime)(\s|$)/.test(q)) return 'prime';
        if (/(^|\s)(kuadrat|perfect\s*square)(\s|$)/.test(q)) return 'square';
        if (/(^|\s)(kubik|perfect\s*cube)(\s|$)/.test(q)) return 'cube';
        return null;
    },

    isPrime: function(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        for (var i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
        return true;
    },

    reply: function(ans) {
        if (ans) {
            NumPlay.sfx('correct.wav');
            this.addMsg('ai', '<b class="yes">\u2714 Ya</b>');
        } else {
            NumPlay.sfx('wrong.wav');
            this.addMsg('ai', '<b class="no">\u2716 Tidak</b>');
        }
    },

    addMsg: function(who, html) {
        var area = NumPlay.el('D_chat');
        var div = document.createElement('div');
        div.className = 'm ' + who;
        div.innerHTML = '<div class="b">' + html + '</div>';
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    },

    addSys: function(t) { this.addMsg('sys', t); },

    ask: function(q) {
        if (this.state.over) return;
        var display = q.includes('?') ? q : q + '?';
        var clean = q.trim().toLowerCase().replace(/\?+$/, '').replace(/[.,!]+$/g, '');
        NumPlay.sfx('click.wav');
        this.addMsg('user', display);
        var self = this;
        setTimeout(function() { self.process(clean); }, 150);
    },

    send: function() {
        var inp = NumPlay.el('D_inp');
        var val = inp.value.trim();
        if (!val) return;
        inp.value = '';
        this.ask(val);
    },

    process: function(raw) {
        var s = this.state;
        var q = this.normalize(raw);
        var nums = q.match(/\d+/g);
        var n = nums ? parseInt(nums[0]) : null;
        var t = this.detectType(q);

        if (t === 'more' && n !== null) this.reply(s.secret > n);
        else if (t === 'less' && n !== null) this.reply(s.secret < n);
        else if (t === 'div' && n !== null) this.reply(n > 0 && s.secret % n === 0);
        else if (t === 'between' && nums && nums.length >= 2) {
            var lo = Math.min(parseInt(nums[0]), parseInt(nums[1]));
            var hi = Math.max(parseInt(nums[0]), parseInt(nums[1]));
            this.reply(s.secret >= lo && s.secret <= hi);
        }
        else if (t === 'even') this.reply(s.secret % 2 === 0);
        else if (t === 'odd') this.reply(s.secret % 2 !== 0);
        else if (t === 'prime') this.reply(this.isPrime(s.secret));
        else if (t === 'square') this.reply(Number.isInteger(Math.sqrt(s.secret)));
        else if (t === 'cube') this.reply(Number.isInteger(Math.cbrt(s.secret)));
        else if (/^-?\d+$/.test(q)) {
            var g = parseInt(q);
            var self = this;
            if (g < 1 || g > s.max) {
                this.addMsg('ai', 'Angkanya antara <b class="yes">1</b> dan <b class="yes">' + s.max + '</b>');
            } else if (g === s.secret) {
                s.over = true;
                NumPlay.sfx('correct.wav');
                this.addMsg('ai', '<b class="win">\u2714 Ya!</b>');
                this.addSys('Game selesai!');
                NumPlay.el('D_quick').innerHTML = '<button class="qp" onclick="NumPlay.games.detective.start()" style="border-color:#6366f1;color:#6366f1;padding:8px 20px">Mulai Lagi</button>';
                NumPlay.showModal('\ud83c\udfc6', 'Benar!', 'Angkanya ' + s.secret, '', function() { self.start(); });
            } else {
                NumPlay.sfx('wrong.wav');
                this.addMsg('ai', '<b class="no">\u2716 Bukan</b>');
            }
        } else {
            this.addMsg('ai', 'Aku nggak ngerti. Coba: <b>"lebih dari 50?"</b> atau tebak angka.');
        }
    },

    buildQuickBtns: function() {
        var s = this.state;
        var h = Math.floor(s.max / 2);
        var q = Math.floor(s.max / 4);
        var self = this;
        var btns = ['Lebih dari ' + h + '?', 'Kurang dari ' + q + '?', 'Genap?', 'Ganjil?', 'Prima?', 'Kelipatan 3?', 'Kelipatan 5?', 'Kelipatan 7?'];
        var html = '';
        for (var i = 0; i < btns.length; i++) {
            html += '<button class="qp" onclick="NumPlay.games.detective.ask(\'' + btns[i] + '\')">' + btns[i] + '</button>';
        }
        NumPlay.el('D_quick').innerHTML = html;
    },

    setDiff: function(i, el) {
        this.state.max = [50, 100, 200][i];
        NumPlay.setActivePill(el);
        this.start();
    },

    start: function() {
        var s = this.state;
        s.secret = Math.floor(Math.random() * s.max) + 1;
        s.over = false;
        NumPlay.el('D_chat').innerHTML = '';
        this.addSys('Aku sudah pilih angka dari 1 sampai ' + s.max + '. Mulai bertanya!');
        this.buildQuickBtns();
        NumPlay.el('D_inp').value = '';
        NumPlay.el('D_inp').focus();
    },

    render: function() {
        var s = this.state;
        if (!s.max) s.max = 50;

        NumPlay.el('app').innerHTML =
            '<div class="card">' +
            NumPlay.topBar(this.name, 'Komputer pilih angka, kamu yang nanya') +
            NumPlay.pills(['1\u201350', '1\u2013100', '1\u2013200'], [50, 100, 200].indexOf(s.max), 'NumPlay.games.detective.setDiff') +
            '<div class="chat-box" id="D_chat"></div>' +
            '<div class="quick-bar" id="D_quick"></div>' +
            '<div class="input-bar">' +
                '<input type="text" class="field" id="D_inp" placeholder="Tanya atau tebak angka..." autocomplete="off" onkeypress="if(event.key===\'Enter\')NumPlay.games.detective.send()">' +
                '<button class="btn" onclick="NumPlay.games.detective.send()">Kirim</button>' +
            '</div>' +
            '</div>';

        this.start();
    }
});