// ---------- CONFIG ----------
const CATEGORIAS = {
  Ficción: "fiction",
  Ciencia: "science",
  Programación: "programming",
  Historia: "history",
};

const MAX_X_CAT = 40;
const STEP = 4;
const TIPO_CAMBIO = "blue";

// ---------- ESTADO ----------
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let precioMax = 100000;
let USD_TO_ARS = 1290;
let allBooks = [];      // originales
let displayedBooks = []; // los que se muestran después de filtrar
let visibleCount = STEP;

// ---------- UTILS ----------
const $ = (sel) => document.querySelector(sel);
const guardar = () => localStorage.setItem("carrito", JSON.stringify(carrito));
const totalARS = () =>
  carrito.reduce((s, i) => s + (Number(i.precio.match(/\d+/)) || 0), 0);

// ---------- COTIZACIÓN ----------
async function getCotizacion() {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${TIPO_CAMBIO}`);
    USD_TO_ARS = (await res.json()).venta;
  } catch {
    console.warn("Cotización falló");
  }
}

// ---------- UI ----------
function refreshUI() {
  $("#carrito-cuenta").textContent = carrito.length;
  $("#modalTotal").textContent = $(
    "#modalPagoTotal"
  ).textContent = `$${totalARS().toFixed(0)} ARS`;
}

// ---------- CARRITO ----------
function addCarrito(tit, pre) {
  carrito.push({ titulo: tit, precio: pre });
  refreshUI();
  guardar();
  Toastify({
    text: "¡Producto agregado al carrito!",
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "#66c5cc",
      marginRight: "60px",
    },
  }).showToast();
}

window.quitar = (idx) => {
  carrito.splice(idx, 1);
  refreshUI();
  guardar();
  openCarrito();
  Toastify({
    text: "¡Producto eliminado!",
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "#66c5cc",
      marginRight: "60px",
    },
  }).showToast();
};

$("#btnVaciarModal").addEventListener("click", () => {
  carrito = [];
  refreshUI();
  guardar();
  closeModal("#modalCarrito");
  Toastify({
    text: "¡Tu carrito está vacío!",
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "#66c5cc",
      marginRight: "60px",
    },
  }).showToast();
});

$("#btnFinalizarModal").addEventListener("click", () => {
  refreshUI();
  $("#modalPago").showModal();
  closeModal("#modalCarrito");
});

// ---------- CERRAR MODALES ----------
function closeModal(id) {
  $(id).close();
}

function vaciarCarrito() {
  carrito = [];
  refreshUI();
  guardar();
}

const btnPagar = document.querySelector("#modalPago [value='confirm']");

btnPagar.addEventListener("click", (e) => {
  const form = btnPagar.closest("form");   // agarramos el form
  if (!form.checkValidity()) {             // ¿NO pasa validación?
    form.reportValidity();                 // mostramos tooltip nativo
    return;                                // ❌ no seguimos
  }

  // ✅ todo OK
  Swal.fire({
    icon: "success",
    title: "¡Compra Exitosa!",
    text: "En breve recibirá su pedido.",
    timerProgressBar: true,
    showConfirmButton: false,
    timer: 3500,
  });
  vaciarCarrito();
  closeModal("#modalPago");
  closeModal("#modalCarrito");
});

["#modalCarrito", "#modalPago"].forEach((id) => {
  const btn = id === "#modalCarrito" ? "#btnCerrarCarrito" : "[value='cancel']";
  $(btn).addEventListener("click", () => closeModal(id));
  $(id).addEventListener("click", (e) => {
    if (e.target === $(id)) closeModal(id);
  });
});

// ---------- MODALES ----------
function openCarrito() {
  $("#carrito-lista").innerHTML = "";
  carrito.forEach((it, idx) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.innerHTML = `
      <span>${it.titulo} (${it.precio})</span>
      <button onclick="quitar(${idx})"><i class="ri-delete-bin-6-line"></i></button>
    `;
    $("#carrito-lista").appendChild(li);
  });
  refreshUI();
  $("#modalCarrito").showModal();
}
$("#btnCarritoIcon").addEventListener("click", openCarrito);

// ---------- PAGINACIÓN ----------
function renderBooks() {
  $("#catalogo").innerHTML = "";

  // 2. Si no hay libros mostrar mensaje u ocultar
  if (allBooks.length === 0) {
    $("#catalogo").innerHTML = "";
    $("#btnMore").style.display = "none";
    Swal.fire({
      icon: 'error',
      title: 'Sin resultados',
      text: 'No hay libros disponibles en este rango de precio.',
      timerProgressBar: true,
      showConfirmButton: false,
      timer: 3500,
    });
    return;
  }

  allBooks.slice(0, visibleCount).forEach((lib) => {
    const card = document.createElement("article");
    card.className = "libro";
    card.innerHTML = `
      <img src="${lib.img}" alt="${lib.tit}">
      <div class="libro-info">
        <h3>${lib.tit}</h3>
        <p>${lib.aut}</p>
        <div class="libro-actions">
          <p class="precio">${lib.pre}</p>
          <button onclick="addCarrito('${lib.tit}', '${lib.pre}')"><i class="ri-handbag-line"></i></button>
        </div>
      </div>
    `;
    $("#catalogo").appendChild(card);

    
  });
  $("#btnMore").style.display =
    visibleCount >= allBooks.length ? "none" : "block";
}

function loadMore() {
  visibleCount += STEP;
  renderBooks();
  filtrar();
}

// ---------- FILTRAR ----------
$("#precioRange").addEventListener("input", (e) => {
  precioMax = Number(e.target.value) * 1000;
  $("#precioValor").textContent = `$${precioMax} ARS`;
  filtrar();
});

document.querySelectorAll("#sidebar button[data-max]").forEach((btn) => {
  btn.addEventListener("click", () => {
    precioMax = Number(btn.dataset.max) * 1000;
    $("#precioRange").value = precioMax / 1000;
    $("#precioValor").textContent = `$${precioMax} ARS`;
    filtrar();
  });
});

function filtrar() {
  // 1. Filtrar sobre todos los originales
  displayedBooks = allBooks.filter(b =>
    (Number(b.pre.match(/\d+/)) || 0) <= precioMax
  );

  // 2. Pintar solo los visibles
  $("#catalogo").innerHTML = "";
  displayedBooks.slice(0, visibleCount).forEach(lib => {
    const card = document.createElement("article");
    card.className = "libro";
     // lazy load
    card.innerHTML = `
    <img data-src="${lib.img}" alt="${lib.tit}" loading="lazy" class="lazy">
      <div class="libro-info">
        <h3>${lib.tit}</h3>
        <p>${lib.aut}</p>
        <div class="libro-actions">
          <p class="precio">${lib.pre}</p>
          <button onclick="addCarrito('${lib.tit}', '${lib.pre}')">
            <i class="ri-handbag-line"></i>
          </button>
        </div>
      </div>
    `;
    $("#catalogo").appendChild(card);

    //  observamos la imagen apenas la creamos
  const img = card.querySelector('img.lazy');
  imageObserver.observe(img);
  });

  // 3. Decidir botón
  $("#btnMore").style.display =
    visibleCount < displayedBooks.length ? "block" : "none";

  // 4. Mensaje si no hay nada
  if (displayedBooks.length === 0) {
    $("#btnMore").style.display = "none";
    Swal.fire({
      icon: 'error',
      title: 'Sin resultados',
      text: 'No hay libros en este rango.',
      timer: 3500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }
}

// ---------- CARGAR LIBROS ----------
async function cargar(categoria) {
  // botón off antes de empezar
  const btnMore = $("#btnMore");
  if (btnMore) btnMore.style.display = "none";

  // marca activa
  [...$("#categoriasSidebar").children].forEach(b =>
    b.classList.toggle("activo", b.textContent === categoria)
  );

  // loader
  $("#catalogo").innerHTML = '<div class="loader"></div>';

  // petición
  const url = `https://www.googleapis.com/books/v1/volumes?q=${CATEGORIAS[categoria]}&maxResults=${MAX_X_CAT}`;
  const data = await (await fetch(url)).json();

  // guardar originales
  allBooks = (data.items || [])
    .map(item => {
      const usd = item.saleInfo?.listPrice?.amount ?? 0;
      if (usd === 0) return null;
      const ars = (usd * USD_TO_ARS).toFixed(0);
      return {
        tit: item.volumeInfo.title,
        aut: item.volumeInfo.authors?.join(", ") || "Anónimo",
        pre: `$${ars} ARS`,
        img: item.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x192?text=Sin+portada",
      };
    })
    .filter(Boolean);

  // reiniciar contadores y filtrar/pintar
  displayedBooks = [...allBooks];
  visibleCount = STEP;
  precioMax = 100000;           // reseteamos rango
  $("#precioRange").value = 100;
  $("#precioValor").textContent = "$100.000 ARS";
  filtrar();
  renderPopulares();
}

// ---------- INICIO ----------
document.addEventListener("DOMContentLoaded", () => {
  refreshUI();
  const btnMore = document.createElement("button");
  btnMore.id = "btnMore";
  btnMore.textContent = "Mostrar más";
  btnMore.style.display = "none";
  btnMore.addEventListener("click", loadMore);
  $("#catalogo").after(btnMore);
});

(async () => {
  await getCotizacion();
  const nav = $("#categoriasSidebar");
  Object.keys(CATEGORIAS).forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => cargar(cat);
    nav.appendChild(btn);
  });
  cargar("Ficción");
})();


// ----------SLIDER SECCIÓN ÉXITOS (bestsellers) ----------
function renderPopulares() {
  // 1. Ordenar por rating (o por cantidad de ratings)
  const populares = [...allBooks]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);                         // 8 libros

  const slider = $("#popularSlider");
  slider.innerHTML = "";                // limpiamos

  populares.forEach(lib => {
    const slide = document.createElement("div");
    slide.className = "popular-slide";
    slide.innerHTML = `
    <article class="libro">
      <img src="${lib.img}" alt="${lib.tit}">
      <div class="libro-info">
        <h3>${lib.tit}</h3>
        <p>${lib.aut}</p>
        <div class="libro-actions">
          <p class="precio">${lib.pre}</p>
          <button onclick="addCarrito('${lib.tit}', '${lib.pre}')">
            <i class="ri-handbag-line"></i>
          </button>
        </div>
      </div>
    </article>
  `;
    slider.appendChild(slide);
  });
}

// ---------- LAZY LOAD (refuerzo) ----------
const imageObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(ent => {
    if (ent.isIntersecting) {
      const img = ent.target;
      img.src = img.dataset.src;      // data-src → src
      img.classList.add('loaded');    // fade-in suave
      obs.unobserve(img);             // dejamos de observar
    }
  });
}, { rootMargin: '50px' });          // empieza 50px antes





