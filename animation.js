(function () {
    // EAN-13 / ISBN-13 encoding tables
    const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
    const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
    const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
    const P = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

    function encode(d) {
        const parity = P[+d[0]];
        let bits = '101';
        for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === 'L' ? L : G)[+d[i]];
        bits += '01010';
        for (let i = 7; i <= 12; i++) bits += R[+d[i]];
        return bits + '101';
    }

    function barcodeSVG(d) {
        const bits = encode(d), q = 10;
        let rects = '', i = 0;
        while (i < 95) {
            if (bits[i] === '1') {
                let j = i;
                while (j < 95 && bits[j] === '1') j++;
                const guard = i < 3 || (i >= 45 && i < 50) || i >= 92;
                rects += `<rect x="${q + i}" y="0" width="${j - i}" height="${guard ? 64 : 58}"/>`;
                i = j;
            } else i++;
        }
        return `<svg viewBox="0 0 115 78" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
            <g fill="#111">${rects}</g>
            <g fill="#111" font-family="monospace" font-size="9" font-weight="600">
                <text x="1" y="74">${d[0]}</text>
                <text x="${q + 3}" y="74" textLength="42" lengthAdjust="spacing">${d.slice(1, 7)}</text>
                <text x="${q + 50}" y="74" textLength="42" lengthAdjust="spacing">${d.slice(7)}</text>
            </g></svg>`;
    }

    const display = document.getElementById('display');
    const status  = document.getElementById('status');
    const shelf   = document.getElementById('shelf');
    const countEl = document.getElementById('count');
    const btn     = document.getElementById('myButton');
    const pre     = document.getElementById('predigits');
    const check   = document.getElementById('check');
    let count = 0;

    // idle placeholder
    display.innerHTML = `<div class="barcode-card ghost">${barcodeSVG('9780000000002')}</div>`;
    status.textContent = 'Your barcode will appear here';

    function show(full) {
        display.innerHTML = `<div class="barcode-card scanning">${barcodeSVG(full)}<i class="scan-line"></i></div>`;
        status.innerHTML = `ISBN-13: <b>${full}</b>`;

        const mini = document.createElement('div');
        mini.className = 'mini';
        mini.title = full;
        mini.innerHTML = barcodeSVG(full);
        shelf.prepend(mini);
        while (shelf.children.length > 12) shelf.lastChild.remove();

        countEl.textContent = ++count;
    }

    // runs after script.js has filled in the check digit
    btn.addEventListener('click', () => {
        setTimeout(() => {
            const digits = (pre.value || '').replace(/[\s-]/g, '');
            const chk = check.value;
            if (!/^\d{12}$/.test(digits) || !/^\d$/.test(chk)) {
                status.textContent = 'Enter a valid 12-digit number to generate a barcode.';
                return;
            }
            show(digits + chk);
        }, 0);
    });
})();