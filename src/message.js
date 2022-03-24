
export default new class {
    #messages = document.querySelector('#messages');

    send(text, type='none', duration=3500, fadeTime=500) {

        const message = document.createElement('div');
        message.classList.add('message');
        message.classList.add(type);
        message.innerText = text;

        this.#messages.prepend(message);

        setTimeout(() => {

            message.style.transition = `opacity ${fadeTime}ms`;
            message.style.opacity = 0;

            setTimeout(() => {
                this.#messages.removeChild(message);
            }, fadeTime);

        }, duration - fadeTime);

    }
}
