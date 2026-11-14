// Visual layer only. Your script.js still does the calculation;
// this file waits for its result and plays the book animation.
(() => {
    const input = document.getElementById('predigits');
    const check = document.getElementById('check');
    const button = document.getElementById('myButton');
    const scene = document.getElementById('scene');
    const slot = document.getElementById('slot');
    const shelf = document.getElementById('shelf');
    const count = document.getElementById('count');
    const status = document.getElementById('status');

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const T = ms => (reduce ? ms * 0.2 : ms);
    const sleep = ms => new Promise(r => setTimeout(r, T(ms)));
    const say = html => { status.innerHTML = html; };

    const queue = [];
    let busy = false, made = 0, hue = 285;

    const fmt = c => `${c[0]} ${c.slice(1, 7)} ${c.slice(7)}`;

    function barcodeSVG(code) {
        let x = 0, rects = '';
        const bar = (w, dark) => { if (dark) rects += `<rect x="${x}" y="0" width="${w}" height="40"/>`; x += w; };
        [0, 1, 2].forEach(i => bar(1, i % 2 === 0));
        for (const ch of code) {
            const d = +ch;
            for (let k = 0; k < 4; k++) bar(((d * 3 + k * 3) % 3) + 1 + (k === 2 ? d % 2 : 0), k % 2 === 0);
        }
        [0, 1, 2].forEach(i => bar(1, i % 2 === 0));
        return `<svg viewBox="0 0 ${x} 40" preserveAspectRatio="none" fill="#111">${rects}</svg>`;
    }
    const stickerHTML = code => barcodeSVG(code) + `<em>${fmt(code)}</em>`;

    function makeBook() {
        const wrap = document.createElement('div');
        wrap.className = 'book-wrap';
        wrap.innerHTML = `
            <div class="book" style="--h:${hue}">
                <div class="face front">
                    <small>GLK PRESS</small>
                    <div class="lines"><i></i><i></i></div>
                    <div class="spot"><span>ISBN</span></div>
                </div>
                <div class="face spine"></div>
                <div class="face pages-t"></div>
            </div>`;
        hue = (hue + 47) % 360;
        return wrap;
    }

    const anim = (el, kf, ms, opt = {}) =>
        el.animate(kf, { duration: T(ms), easing: 'ease-out', fill: 'forwards', ...opt }).finished;

    function enter(book) {
        book.animate(
            [{ transform: 'translateX(-160%) rotate(-12deg)', opacity: 0 },
             { transform: 'translateX(0) rotate(0)', opacity: 1 }],
            { duration: T(800), easing: 'cubic-bezier(.2,.8,.2,1)' });
    }

    async function attach(code) {
        const book = slot.querySelector('.book-wrap');
        const spot = book.querySelector('.spot');
        say(`Printing barcode <b>${fmt(code)}</b>…`);

        // make sure the book is on screen
        const sr = scene.getBoundingClientRect();
        if (sr.top < 60 || sr.bottom > innerHeight - 20) {
            scene.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(600);
        }

        // freeze the idle bob so the landing spot holds still
        book.style.animationPlayState = 'paused';

        const s = check.getBoundingClientRect();
        const sx = s.left + s.width / 2 - 54;
        const sy = Math.min(Math.max(s.top + s.height / 2 - 34, 40), innerHeight - 110);
        const r = spot.getBoundingClientRect();
        const tx = r.left + r.width / 2 - 54;
        const ty = r.top + r.height / 2 - 34;
        const mx = (sx + tx) / 2, my = Math.min(sy, ty) - 110;

        const flyer = document.createElement('div');
        flyer.className = 'sticker flyer';
        flyer.innerHTML = stickerHTML(code);
        document.body.append(flyer);

        const f = (x, y, ry, rz, sc, o = 1) => ({
            transform: `translate(${x}px,${y}px) perspective(700px) rotateY(${ry}deg) rotate(${rz}deg) scale(${sc})`,
            opacity: o
        });
        // pop up -> hover -> arc across the screen -> land on the cover
        await flyer.animate([
            f(sx, sy, 0, -25, 0, 0),
            { ...f(sx, sy - 40, 0, -6, 1.4), offset: .16 },
            { ...f(sx, sy - 40, 0, 4, 1.35), offset: .30 },
            { ...f(mx, my, 15, 12, 1.6), offset: .62 },
            { ...f(tx, ty - 30, 28, 3, 1.2), offset: .88 },
            f(tx, ty, 28, 0, 1)
        ], { duration: T(2600), easing: 'cubic-bezier(.45,0,.25,1)' }).finished;

        // stick it on the cover
        say('Attaching barcode to the cover…');
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        sticker.innerHTML = stickerHTML(code);
        spot.classList.add('filled');
        spot.replaceChildren(sticker);
        flyer.remove();
        sticker.animate(
            [{ transform: 'scale(1.1)', filter: 'brightness(1.5)' }, { transform: 'scale(1)', filter: 'none' }],
            { duration: T(250) });
        await anim(book, [
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(5px) scale(.97,.96)' },
            { transform: 'translateY(0) scale(1)' }
        ], 350, { fill: 'none' });

        say('Barcode attached <b>✓</b> Shelving the book…');
        await sleep(700);

        // move the finished book onto the shelf
        const mini = document.createElement('div');
        mini.className = 'mini';
        const clone = book.cloneNode(true);
        clone.style.animationPlayState = '';
        mini.append(clone);
        mini.style.visibility = 'hidden';
        shelf.append(mini);
        while (shelf.children.length > 10) shelf.firstElementChild.remove();

        const b = book.getBoundingClientRect(), m = mini.getBoundingClientRect();
        const dx = m.left + m.width / 2 - (b.left + b.width / 2);
        const dy = m.top + m.height / 2 - (b.top + b.height / 2);
        await anim(book, [
            { transform: 'translate(0,0) scale(1)' },
            { transform: `translate(${dx}px,${dy}px) scale(.34)` }
        ], 900, { easing: 'cubic-bezier(.5,0,.3,1)' });
        mini.style.visibility = 'visible';
        book.remove();
        count.textContent = ++made;

        // fresh blank book
        const next = makeBook();
        slot.append(next);
        enter(next);
        say('Blank book ready. Enter the next ISBN.');
        await sleep(800);
    }

    async function run() {
        busy = true;
        while (queue.length) await attach(queue.shift());
        busy = false;
    }

    // runs after script.js's own click handler, so #check is already filled in
    button.addEventListener('click', () => {
        const pre = input.value, chk = check.value;
        if (!/^\d{12}$/.test(pre) || chk === '') {
            input.animate(
                [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' },
                 { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }],
                { duration: 300 });
            return;
        }
        queue.push(pre + chk);
        if (!busy) run();
    });

    // first blank book
    const first = makeBook();
    slot.append(first);
    enter(first);
    say('Blank book ready. Enter an ISBN to begin.');
})();