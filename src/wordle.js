

import words from '../data/words.json' assert { type: "json" };
import message from './message.js';

import { mulberry32 } from './util/mulberry32.js';


const rand = Math.floor(mulberry32(0).next(0, 1e+10));


const GUESSTYPES = {

    notset: 0,
    none: 1,
    has: 2,
    correct: 3,

    types: {
        0: 'notset',
        1: 'none',
        2: 'has',
        3: 'correct'
    }

}


class Guess {
    word = '';
    checks = [];

    constructor(word='', guessWord='') {
        this.word = word;
        this.check(guessWord);
    }

    check(guessWord='') {
        this.checks = [];


        for(let i in this.word) {

            if(!guessWord.includes(this.word[i])) {
                this.checks[i] = GUESSTYPES.none;
            } else if (this.word[i] == guessWord[i]) {
                this.checks[i] = GUESSTYPES.correct;
            } else {
                this.checks[i] = GUESSTYPES.has;
            }

        }

        
        const forEachOfType = (type, func) => {
            for(let i in this.word) {
                if(this.checks[i] != type) continue;
                func(i, this.word[i]);
            }
        }


        let letterCounts = {};
        forEachOfType(GUESSTYPES.correct, (i, l) => {
            if(!letterCounts[l]) letterCounts[l] = 1;
            else letterCounts[l]++;
        });

        forEachOfType(GUESSTYPES.has, (i, l) => {
            if(!letterCounts[l]) letterCounts[l] = 1;
            else letterCounts[l]++;
            
            const guessLetterCount = guessWord.split('').reduce((count, letter) => count + (letter == l), 0);

            if(guessLetterCount >= letterCounts[l]) return;

            this.checks[i] = GUESSTYPES.none;
            letterCounts[l]--;
        });


    }

    highest(letter) {
        let highest = GUESSTYPES.notset;
        for(let i in this.word) {
            if(this.word[i] != letter) continue;
            if(this.checks[i] > highest) highest = this.checks[i];
        }
        return highest;
    }

}


const wordle = new class {
    /** @type {String} */
    #word = null;
    /** @type {Guess[]} */
    #guesses = [];
    #currentGuess = '';
    #isComplete = false;

    constructor() {
        this.setTodaysWord();
        this.setNumGuesses(6);
        this.createHtml();

        document.addEventListener('keydown', (e) => {
            this.input(e.key);
        });

    }

    setTodaysWord() {
        const day = Math.floor((Date.now() - new Date().getTimezoneOffset()*60*1000) / 1000 / 60 / 60 / 24);
        const random = mulberry32(day + rand);
        const index = Math.floor(random.next(0, words.possible.length));
        
        this.#word = words.allowed[words.possible[index]];
        this.#isComplete = false;
    }

    setNumGuesses(count=6) {
        this.#guesses = new Array(count).fill(null);
        this.#currentGuess = '';
    }



    #grid = document.querySelector('#words-grid');
    #keyboard = document.querySelector('#keyboard');
    #message = document.querySelector('#message');

    async createHtml() {

        // Destroy old stuffs if need to
        while(this.#grid.firstChild) {
            this.#grid.removeChild(this.#grid.firstChild);
        }
        while(this.#keyboard.firstChild) {
            this.#keyboard.removeChild(this.#keyboard.firstChild);
        }


        // Create the word grid
        for(let i=0; i < this.#guesses.length; i++) {
            const row = document.createElement('div');
            row.classList.add('words-row');

            for(let j=0; j < this.#word.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('words-cell');
                cell.classList.add('state');

                row.appendChild(cell);
            }

            this.#grid.appendChild(row);
        }



        const keyboard = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ];

        for(let i=0; i < keyboard.length; i++) {
            const row = document.createElement('div');
            row.classList.add('keyboard-row');

            for(let j=0; j < keyboard[i].length; j++) {
                const letter = keyboard[i][j];

                const button = document.createElement('div');
                button.classList.add('keyboard-button');

                button.onclick = () => {
                    this.input(letter);
                }
                button.classList.add('state');

                button.innerText = letter;

                button.setAttribute('data-letter', letter);

                row.appendChild(button);
            }

            this.#keyboard.appendChild(row);
        }



        const ENTER = document.createElement('div');
        ENTER.classList.add('keyboard-button');
        ENTER.classList.add('oneandhalf');
        ENTER.onclick = () => {
            this.input('Enter');
        }
        ENTER.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z"/>
            </svg>
        `;
        this.#keyboard.childNodes[2].prepend(ENTER);

        const BACKSPACE = document.createElement('div');
        BACKSPACE.classList.add('keyboard-button');
        BACKSPACE.classList.add('oneandhalf');
        BACKSPACE.onclick = () => {
            this.input('Backspace');
        }
        BACKSPACE.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-backspace" viewBox="0 0 16 16">
                <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
                <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
            </svg>
        `;
        this.#keyboard.childNodes[2].appendChild(BACKSPACE);






        this.updateHtml();

    }

    async updateHtml() {

        for(let i=0; i < this.#guesses.length; i++) {
            if(this.#guesses[i] == null) continue;

            for(let j=0; j < this.#word.length; j++) {
                // For the life of me I cannot figure out why ':nth-child(i)' wont work for this. Am I just dumb?
                const cell = this.#grid.childNodes[i].childNodes[j];

                this.flipAnim(cell, j*150).then(() => {
                    
                    cell.innerText = this.#guesses[i].word[j];

                    cell.setAttribute('data-state', GUESSTYPES.types[this.#guesses[i].checks[j]]);
                    
                }).catch(() => {});

            }
        }

        
        this.#keyboard.querySelectorAll('.keyboard-button[data-letter]').forEach(button => {

            const letter = button.getAttribute('data-letter');

            // Get greatest state
            const state = this.#guesses.reduce((prev, cur) => {
                if(!cur) return prev;
                const curHigh = cur.highest(letter);
                return ( curHigh > prev ? curHigh : prev );
            }, GUESSTYPES.notset);
            
            if(state != GUESSTYPES.notset) {
                button.setAttribute('data-state', GUESSTYPES.types[state]);
            }
            
        });
        
        this.setGuessHtml();

    }

    setGuessHtml() {

        for(let i=0; i < this.#guesses.length; i++) {
            if(this.#guesses[i] != null) continue;

            for(let j=0; j < this.#word.length; j++) {
                const cell = this.#grid.childNodes[i].childNodes[j];

                cell.innerText = this.#currentGuess[j] || '';
            }
            break;

        }

    }

    async flipAnim(elem, delay=0) {
        return new Promise((resolve, reject) => {
            if(elem.classList.contains('letter-flip')) {
                reject();
                return;
            }

            elem.classList.add('letter-flip');

            const anim = elem.animate([
                { transform: 'rotateY(0deg)' },
                { transform: 'rotateY(90deg)' },
            ], {
                delay: delay,
                duration: 300,
                easing: 'ease-in'
            });

            anim.onfinish = () => {
                elem.animate([
                    { transform: 'rotateY(90deg)' },
                    { transform: 'rotateY(0deg)' },
                ], {
                    duration: 300,
                    easing: 'ease-out'
                });
                resolve();
            }

        });
    }

    shakeAnim() {
        this.#grid.animate([
            { transform: 'translate(-10px, 0)', backgroundColor: 'rgba(255, 0, 0, 0.05)' },
            { transform: 'translate(10px, 0)', backgroundColor: 'rgba(255, 0, 0, 0.05)' }
        ], {
            duration: 100,
            iterations: 3
        });
    }




    input(key) {

        if(this.#isComplete) return;

        if(key == 'Backspace') {
            this.#currentGuess = this.#currentGuess.slice(0, this.#currentGuess.length-1);
            this.setGuessHtml();
            return;
        }
        if(key == 'Enter') {

            if(this.guessWord(this.#currentGuess)) {
                this.#currentGuess = '';
            }
            this.updateHtml();

            return;
        }

        
        if(this.#currentGuess.length >= this.#word.length) return;

        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const letter = key.toLocaleLowerCase();
        if(letters.indexOf(letter) == -1) return;

        this.#currentGuess += letter;

        this.setGuessHtml();

    }

    /**
     * Guess a word.
     * @param {String} guess 
     * @returns {Boolean} If word guess was added
     */
    guessWord(guess) {

        const err = (text) => {
            this.shakeAnim();
            message.send(text);
            return false;
        }
        if(guess.length == '') return err('You need to input a word!');
        if(guess.length != this.#word.length) return err('Word is not long enough!');
        if(this.#guesses.some((g) => g?.word == guess)) return err('You already guessed that word!');
        if(!words.allowed.includes(guess)) return err('That is not a valid word!');

        for(let i in this.#guesses) {
            if(this.#guesses[i] != null) continue;

            this.#guesses[i] = new Guess(guess, this.#word);
            if(this.#guesses[i].word == this.#word) this.#isComplete = true;

            break;
        }

        return true;
    }


}



console.log(wordle);