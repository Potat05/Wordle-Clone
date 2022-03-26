
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



export { GUESSTYPES, Guess };