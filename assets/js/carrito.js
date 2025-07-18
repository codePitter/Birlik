// Inicializar carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Escucha de botones "Agregar al carrito"
document.querySelectorAll('.btn-agregar').forEach(boton => {
    boton.addEventListener('click', () => {
        const card = boton.closest('.card');
        const id = card.dataset.id;
        const nombre = card.querySelector('h3').textContent;
        const precio = parseFloat(card.querySelector('p').textContent.replace('$', ''));

        const existente = carrito.find(p => p.id === id);
        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({ id, nombre, precio, cantidad: 1 });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert(`${nombre} agregado al carrito`);
    });
});

