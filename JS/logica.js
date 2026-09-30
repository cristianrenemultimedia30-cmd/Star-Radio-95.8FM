// ------------------------------------------------------------
// Efecto parallax: cada capa se mueve a distinta velocidad
// según el scroll. Al subir, todo vuelve a su lugar solo.
//
// vx = píxeles que se mueve en horizontal por cada píxel de scroll
//      (negativo = izquierda, positivo = derecha)
// vy = lo mismo en vertical
//      (negativo = arriba, positivo = abajo)
// zoom = cuánto se acerca la capa (0.12 = 12 % al final de la escena)
//
// Mientras más grande el número, más rápido se mueve la capa.
// ------------------------------------------------------------

// Nota: la página ya sube sola al hacer scroll. Un vy POSITIVO hace que la
// capa suba más lento que la página (se ve "más lejos"); uno negativo, más rápido.
const capas = [
    { el: document.querySelector("#fondo"),     vx: 0,     vy: 0,    zoom: 0.12 },
    { el: document.querySelector("#titulo"),    vx: 0,     vy: 0.3 },
    { el: document.querySelector("#banner"),    vx: 0,     vy: 0.9 },
    { el: document.querySelector("#campesino"), vx: -0.7,  vy: 0.35 },
    { el: document.querySelector("#abuelo"),    vx: -0.25, vy: 0.55 },
    { el: document.querySelector("#dj"),        vx: 0.25,  vy: 0.75 },
    { el: document.querySelector("#joven"),     vx: 0.7,   vy: 0.35 },
];

const escena = document.querySelector(".parallax");
const SUAVIZADO = 0.12; // 0.05 = más lento y suave, 0.3 = más directo

let objetivo = 0; // scroll real
let actual = 0;   // scroll suavizado que se dibuja
let animando = false;

// Si el usuario pidió "reducir movimiento" en su sistema, no se anima nada
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function leerScroll() {
    // Solo importa el tramo en que la escena está visible
    objetivo = Math.min(window.scrollY, escena.offsetHeight);
    if (!animando) {
        animando = true;
        requestAnimationFrame(dibujar);
    }
}

function dibujar() {
    actual += (objetivo - actual) * SUAVIZADO;
    if (Math.abs(objetivo - actual) < 0.1) actual = objetivo;

    const progreso = actual / escena.offsetHeight; // 0 a 1

    for (const capa of capas) {
        const x = capa.vx * actual;
        const y = capa.vy * actual;
        const escala = 1 + (capa.zoom || 0) * progreso;
        capa.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${escala})`;
    }

    if (actual !== objetivo) {
        requestAnimationFrame(dibujar);
    } else {
        animando = false;
    }
}

if (!sinMovimiento) {
    window.addEventListener("scroll", leerScroll, { passive: true });
    window.addEventListener("resize", leerScroll);
    leerScroll();
}

// ------------------------------------------------------------
// Encabezado fijo: al bajar se le pone fondo para que el menú
// y el logo siempre se lean, incluso sobre las secciones claras.
// (No depende de "reducir movimiento", porque no es una animación de scroll)
// ------------------------------------------------------------
const encabezado = document.querySelector("header");

function marcarEncabezado() {
    encabezado.classList.toggle("con-fondo", window.scrollY > 40);
}

window.addEventListener("scroll", marcarEncabezado, { passive: true });
marcarEncabezado();

// Año automático en el pie de página
document.querySelector("#anio").textContent = new Date().getFullYear();

// ------------------------------------------------------------
// Formulario de contacto: se envía sin recargar la página.
// Necesita que reemplaces TU_CODIGO en el "action" del formulario
// (en contacto.html) por el código que te da formspree.io.
// ------------------------------------------------------------
const formulario = document.querySelector("#form-contacto");
const estado = document.querySelector("#estado-envio");
const boton = formulario.querySelector("button[type='submit']");

function mostrar(texto, tipo) {
    estado.textContent = texto;
    estado.className = tipo;
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (formulario.action.includes("TU_CODIGO")) {
        mostrar("El formulario aún no está conectado. Mientras tanto, escríbenos por WhatsApp.", "error");
        return;
    }

    boton.disabled = true;
    mostrar("Enviando…", "");

    try {
        const respuesta = await fetch(formulario.action, {
            method: "POST",
            body: new FormData(formulario),
            headers: { Accept: "application/json" },
        });
        if (!respuesta.ok) throw new Error("Error de envío");
        formulario.reset();
        mostrar("¡Mensaje enviado! Te responderemos pronto.", "ok");
    } catch (error) {
        mostrar("No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.", "error");
    } finally {
        boton.disabled = false;
    }
});

// Año automático en el pie de página
document.querySelector("#anio").textContent = new Date().getFullYear();