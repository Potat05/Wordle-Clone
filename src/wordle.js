

import words from '../data/words.json' assert { type: "json" };

import { mulberry32 } from './util/mulberry32.js';


const GUESSTYPES = {

    none: 1,
    has: 2,
    correct: 3,

    types: {
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
        const random = mulberry32(day);
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

    async createHtml() {

        while(this.#grid.firstChild) {
            this.#grid.removeChild(this.#grid.firstChild);
        }


        for(let i=0; i < this.#guesses.length; i++) {
            const row = document.createElement('div');
            row.classList.add('words-row');

            for(let j=0; j < this.#word.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('words-cell');

                row.appendChild(cell);
            }

            this.#grid.appendChild(row);
        }



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
            this.updateHtml();
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

        const letters = 'abcdefghijklmnopqrstuvwxyz*';
        const letter = key.toLocaleLowerCase();
        if(letters.indexOf(letter) == -1) return;

        this.#currentGuess += letter;

        this.updateHtml();

    }

    /**
     * Guess a word.
     * @param {String} guess 
     * @returns {Boolean} If word guess was added
     */
    guessWord(guess) {
        if(guess.length != this.#word.length || guess.includes('*') || !words.allowed.includes(guess)) {
            this.shakeAnim();
            return false;
        }

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