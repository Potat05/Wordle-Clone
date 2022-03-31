


const MENUS = new class {
    #menuContainer = document.querySelector('#menus');

    #menu = '';

    set menu(new_menu) {
        this.#menu = new_menu;

        const newMenu = this.#menuContainer.querySelector(`*[data-menu="${this.#menu}"]`);
        const menuType = newMenu.getAttribute('data-menu-type');
        
        switch(menuType) {
            case 'above': {
                newMenu.classList.remove('hidden');
                break; }
            default: {

                this.#menuContainer.querySelectorAll('*[data-menu]').forEach(menu => {
                    if(menu == newMenu) return;
                    menu.classList.add('hidden');
                });

                newMenu.classList.remove('hidden');

                break; }
        }

    }

    get menu() {
        return this.#menu;
    }
}

MENUS.menu = 'game';