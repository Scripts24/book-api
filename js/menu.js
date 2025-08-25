// ---------- MENU RESPONSIVE ----------
(function () {
    const nav = document.getElementById('categorias');
    const carritoBtn = document.getElementById('btnCarritoIcon');

    // Crea botón hamburguesa
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'menuToggle';
    toggleBtn.innerHTML = '<i class="ri-menu-line"></i>';
    toggleBtn.setAttribute('aria-label', 'Menú');
    nav.parentNode.insertBefore(toggleBtn, nav);

    // Crea overlay para cerrar al tocar fuera
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    document.body.appendChild(overlay);

    // Función para abrir/cerrar menú
    function toggleMenu() {
        nav.classList.toggle('open');
        overlay.classList.toggle('open');
    }

    // Eventos
    toggleBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Cerrar al elegir categoría
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') toggleMenu();
    });

    // Botón carrito fuera del menú (siempre visible)
    carritoBtn.style.zIndex = '9999';
})();