// carrito.js

// Inicializar carrito desde localStorage
document.addEventListener('DOMContentLoaded', () => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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

            let cantidadTotal = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
            let listaProductos = carrito.map(p => `• ${p.nombre} (x${p.cantidad})`).join('<br>');
            let mensajeHTML = `
                <strong>Producto agregado al carrito.</strong><br>
                Total: ${cantidadTotal} producto(s)<br>
                ${listaProductos}
            `;
            document.getElementById('toastCarritoMensaje').innerHTML = mensajeHTML;
            let toast = new bootstrap.Toast(document.getElementById('toastCarrito'));
            toast.show();
        });
    });
});

