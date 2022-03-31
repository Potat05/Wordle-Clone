
import { wordle } from './wordle.js';

console.log(wordle);

const wordSeed = document.getElementById('wordSeed');

wordSeed.addEventListener('change', (e) => {
    if(wordSeed.value == '') wordle.seed = null;
    else wordle.seed = Number(wordSeed.value);

    wordle.reset();
});

document.getElementById('wordSeedRandom').addEventListener('click', () => {
    wordSeed.value = Math.floor(Math.random()*100000);

    wordSeed.dispatchEvent(new Event('change'));
});


const gameComplete = document.getElementById('gameComplete');

wordle.onComplete = () => {
    MENUS.menu = 'gamecomplete';

    const completion = wordle.getCompletion();
    if(!completion.isComplete) return;

    gameComplete.querySelector('#gameCompleteText').innerText = completion.text;
    gameComplete.querySelector('#gameCompleteCopy').onclick = () => {
        navigator.clipboard.writeText(completion.text);
    }

    console.log(completion);

}