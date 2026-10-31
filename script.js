document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript Boilerplate Loaded Successfully!');
});

const gs1Input = document.getElementById('gs1pref');
const registrationInput = document.getElementById('registration');
const registrantInput = document.getElementById('registrant');
const pubInput= document.getElementById('publication');
const checkOut = document.getElementById('check');
const button = document.getElementById('myButton');
button.addEventListener('click', calculate);

/*
var gs1Digits = gs1Input.parseInt();
var registrationDigits = gs1Input.parseInt();
var registrantDigits = gs1Input.parseInt();
var pubDigits = gs1Input.parseInt();
*/

function calculate(){
    //concat mga digits para isa lang ka string
    var digitConcat = gs1Input.value + registrationInput.value + registrantInput.value + pubInput.value;
    var runthroughloop = Array.from(digitConcat);
    var singlesum = 0; 

    //step 1 starting from left to right multiply digit by 1 and the next by 3
    for (i=0; i < runthroughloop.length; i++){

        var currentDigit = Number(runthroughloop[i]);
        
        if (i % 2 == 0){
            singlesum += currentDigit*3;
        } 
        else { 
            singlesum += currentDigit*1;
        }
    }

    //get remainder

    var remainder = singlesum % 10;

    //solve for checkdigit
    var checkdigit = 0;
    if (remainder === 0){
        checkdigit = 0;
    } else {
        checkdigit = 10 - remainder;
    }
        //set output
    checkOut.value = checkdigit;
}