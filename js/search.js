// ---------- BÚSQUEDA GLOBAL ----------
let lastToast = '';
const btnSearch = $('#btnSearch');
const searchBar = $('#searchBar');
const searchInput = $('#searchInput');
const btnClose = $('#btnCloseSearch');

// abrir / cerrar barra
btnSearch.addEventListener('click', () => searchBar.classList.add('active'));
btnClose.addEventListener('click', () => {
    searchBar.classList.remove('active');
    searchInput.value = '';
});

// buscar mientras escribe
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 5) return;

    const resultados = allBooks.filter(b =>
        b.tit.toLowerCase().includes(q) ||
        b.aut.toLowerCase().includes(q)
    );

    if (resultados.length === 0) {
        if (lastToast !== q) {
            lastToast = q;
            Toastify({
                text: 'Sin resultados',
                duration: 2500,
                gravity: 'top',
                position: 'right',
                style: { background: '#d60808' }
            }).showToast();
        }
        return;
    }
    lastToast = '';

    mostrarModalBusqueda(resultados[0]);
});

function mostrarModalBusqueda(lib) {
    const modal = $('#modalSearch');
    modal.innerHTML = `
    <h3>${lib.tit}</h3>
    <img src="${lib.img}" alt="${lib.tit}">
    <p>${lib.aut}</p>
    <p class="precio">${lib.pre}</p>
    <p>${lib.desc || 'Sin descripción disponible.'}</p>
    <menu>
        <button type="button" id="btnCloseSearchModal">Cerrar</button>
        <button value="add" onclick="addCarrito('${lib.tit}', '${lib.pre}'); closeModal('#modalSearch');">Agregar al carrito</button>
    </menu>
    `;
    modal.showModal();

    $('#btnCloseSearchModal').addEventListener('click', () => closeModal('#modalSearch'));
}

// cerrar modal al clickear fuera
$('#modalSearch').addEventListener('click', e => {
    if (e.target === $('#modalSearch')) closeModal('#modalSearch');
});