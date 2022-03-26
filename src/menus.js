


const MENUS = new class {
    #menus = document.querySelectorAll('*[data-menu]');

    currentMenu = '';
    
    setMenu(data_menu) {
        this.currentMenu = data_menu;
        this.#menus.forEach(menu => {
            if(menu.getAttribute('data-menu') == data_menu) {
                menu.classList.remove('hidden');
            } else {
                menu.classList.add('hidden');
            }
        });
    }
}

MENUS.setMenu('game');