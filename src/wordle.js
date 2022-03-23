

import words from '../data/words.json' assert { type: "json" };

import { mulberry32 } from './util/mulberry32.js';


const rand = 0;


const wordle = new class {
    /** @type {String} */
    #word = null;
    #guesses = [];
    #numGuesses = 6;
    #currentGuess = '';
    #isComplete = false;

    constructor() {
        this.setTodaysWord();
        this.setNumGuesses(6);
        this.createHtml();


        document.addEventListener('keydown', (e) => {
            if(this.#isComplete) return;

            if(e.key == 'Backspace') {
                this.#currentGuess = this.#currentGuess.slice(0, this.#currentGuess.length-1);
                this.updateHtml();
                return;
            }
            if(e.key == 'Enter') {
                if(this.#currentGuess.length != this.#word.length || this.#currentGuess.includes('*')) {
                    this.shakeAnim();
                    return;
                }
                if(!words.allowed.includes(this.#currentGuess)) {
                    this.shakeAnim();
                    return;
                }

                for(let i=0; i < this.#numGuesses; i++) {
                    if(this.#guesses[i] == null) {
    
                        this.#guesses[i] = this.#currentGuess;
                        this.#currentGuess = '';

                        if(this.#guesses[i] == this.#word) this.#isComplete = true;
    
                        break;
                    }
                }
                
                this.updateHtml();

                return;
            }

            
            if(this.#currentGuess.length >= this.#word.length) return;

            const letters = 'abcdefghijklmnopqrstuvwxyz*';
            const letter = e.key.toLocaleLowerCase();
            if(letters.indexOf(letter) == -1) return;

            this.#currentGuess += letter;

            this.updateHtml();

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
        this.#numGuesses = count;
        this.#guesses = new Array(this.#numGuesses).fill(null);
        this.#currentGuess = '';
    }

    // I think this is correct?
    letter(word, pos) {
        
        const letter = word[pos];
        if(!this.#word.includes(letter)) return 'none';

        let lCount = 0;
        for(let l of this.#word) {
            if(l == letter) lCount++;
        }

        if(this.#word[pos] == letter) return 'correct';
        if(lCount == 1) {
            if(this.#word.includes(letter)) return 'has';
            return 'none';
        }    
        return 'has';

    }




    #grid = document.querySelector('#words-grid');
    #keyboard = document.querySelector('#keyboard');

    async createHtml() {

        while(this.#grid.firstChild) {
            this.#grid.removeChild(this.#grid.firstChild);
        }


        for(let i=0; i < this.#numGuesses; i++) {
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

        for(let i=0; i < this.#numGuesses; i++) {
            if(this.#guesses[i] == null) continue;

            for(let j=0; j < this.#word.length; j++) {
                // For the life of me I cannot figure out why ':nth-child(i)' wont work for this. Am I just dumb?
                const cell = this.#grid.childNodes[i].childNodes[j];

                this.flipAnim(cell, j*150).then(() => {
                    
                    cell.innerText = this.#guesses[i][j];

                    cell.setAttribute('data-state', this.letter(this.#guesses[i], j));
                    
                }).catch(() => {});

            }
        }

        for(let i=0; i < this.#numGuesses; i++) {
            if(this.#guesses[i] == null) {
                for(let j=0; j < this.#word.length; j++) {
                    const cell = this.#grid.childNodes[i].childNodes[j];

                    cell.innerText = this.#currentGuess[j] || '';
                }
                break;
            }
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

}



console.log(wordle);