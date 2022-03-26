
import { wordle } from './wordle.js';

console.log(wordle);

const wordSeed = document.getElementById('wordSeed');

wordSeed.addEventListener('change', (e) => {
    wordle.seed = Number(e.target.value);
    wordle.reset();
});

document.getElementById('wordSeedRandom').addEventListener('click', () => {
    wordSeed.value = Math.floor(Math.random()*100000);
    wordSeed.dispatchEvent(new Event('change'));
});
