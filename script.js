document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript Boilerplate Loaded Successfully!');
});

const predigitsinput = document.getElementById('predigits');
const checkOut = document.getElementById('check');
const button = document.getElementById('myButton');
const msg = document.getElementById('msg');

button.addEventListener('click', calculate);
predigitsinput.addEventListener('input', liveCheck);

// ignore spaces and hyphens so "978-0-306-40615" still counts as 12 digits
function cleanDigits() {
    return predigitsinput.value.replace(/[\s-]/g, '');
}

// returns { ok, type, text } describing the current input
function validate() {
    const v = cleanDigits();

    if (!/^\d*$/.test(v)) {
        return { ok: false, type: 'error', text: 'Digits only, please. Remove any letters or symbols.' };
    }
    if (v.length > 12) {
        const extra = v.length - 12;
        return { ok: false, type: 'error',
            text: `Too many digits: ${v.length}/12. Remove ${extra} digit${extra === 1 ? '' : 's'}.` };
    }
    if (v.length < 12) {
        const short = 12 - v.length;
        return { ok: false, type: 'error',
            text: `You're short by ${short} digit${short === 1 ? '' : 's'} (${v.length}/12).` };
    }
    return { ok: true, type: 'ok', text: 'Perfect, 12 digits entered.' };
}

function showMessage(result) {
    msg.textContent = result.text;
    msg.className = 'msg ' + result.type;
    predigitsinput.classList.toggle('invalid', !result.ok && result.text !== '');
}

// runs every time the user types
function liveCheck() {
    checkOut.value = ''; // clear any old result so it never goes stale

    if (cleanDigits().length === 0) {
        msg.textContent = '';
        msg.className = 'msg';
        predigitsinput.classList.remove('invalid');
        return;
    }
    showMessage(validate());
}

function calculate() {
    const result = validate();

    // error if fewer or more than 12 digits (or non-digits)
    if (!result.ok) {
        checkOut.value = '';
        showMessage(result);
        predigitsinput.classList.remove('shake');
        void predigitsinput.offsetWidth; // restart the shake animation
        predigitsinput.classList.add('shake');
        predigitsinput.focus();
        return;
    }

    showMessage(result);

    var runthroughloop = Array.from(cleanDigits());
    var singlesum = 0;

    //step 1 starting from left to right multiply digit by 1 and the next by 3
    for (let i = 0; i < runthroughloop.length; i++) {

        var currentDigit = Number(runthroughloop[i]);

        if (i % 2 == 0) {
            singlesum += currentDigit * 1;
        }
        else {
            singlesum += currentDigit * 3;
        }
    }

    //get remainder
    var remainder = singlesum % 10;

    //solve for checkdigit
    var checkdigit = 0;
    if (remainder === 0) {
        checkdigit = 0;
    } else {
        checkdigit = 10 - remainder;
    }

    //set output
    checkOut.value = checkdigit;
}