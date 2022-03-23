


const THEMES = new class Theme {
    #attributeElement = document.documentElement;
    #attributeName = 'theme';
    #attributeValue = 'light'; 

    constructor() {
        this.#setElement();
    }

    #setElement() {
        this.#attributeElement.setAttribute(this.#attributeName, this.#attributeValue);
    }


    light = 'light';
    dark = 'dark';

    get theme() {
        return this.#attributeValue;
    }

    set theme(theme=this.light) {
        if(theme == this.#attributeValue) return;

        this.#attributeValue = theme;

        this.#setElement();
    }

}



// Start theme on system theme & change when system theme changes

const getPrefersColorScheme = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches  ? THEMES.light : THEMES.dark;

THEMES.theme = getPrefersColorScheme();