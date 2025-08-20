/* ===== Layout (header) ===== */
window.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const main = document.querySelector('.container-checkout');
    if (header && main) main.style.paddingTop = (header.offsetHeight + 65) + 'px';
});
function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky')
        && !selectHeader.classList.contains('sticky-top')
        && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 1 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
}
document.addEventListener('scroll', toggleScrolled);
window.addEventListener('load', toggleScrolled);

/* ===== Modal bonito (reemplazo de alert/confirm) ===== */
function ensureUiModal() {
    let el = document.getElementById('uiModal');
    if (el) return el;
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal fade" id="uiModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header border-0">
            <h5 class="modal-title" id="uiModalTitle">Aviso</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body" id="uiModalBody"></div>
          <div class="modal-footer border-0 gap-2">
            <button type="button" class="btn btn-outline-secondary" id="uiModalCancel" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" id="uiModalOk">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `);
    return document.getElementById('uiModal');
}
async function showAlert(message, opts = {}) {
    const { title = 'Aviso', okText = 'Entendido' } = opts;
    const el = ensureUiModal();
    const hasBootstrap = !!window.bootstrap?.Modal;
    if (!hasBootstrap) { alert(message); return; }
    const modal = new bootstrap.Modal(el);
    const titleEl = document.getElementById('uiModalTitle');
    const bodyEl = document.getElementById('uiModalBody');
    const okBtn = document.getElementById('uiModalOk');
    const cancelBtn = document.getElementById('uiModalCancel');
    titleEl.textContent = title;
    bodyEl.innerHTML = String(message).replace(/\n/g, '<br>');
    cancelBtn.classList.add('d-none');
    okBtn.textContent = okText;
    return new Promise(resolve => {
        const onOk = () => { cleanup(); modal.hide(); resolve(); };
        const onHidden = () => { cleanup(); resolve(); };
        function cleanup() {
            okBtn.removeEventListener('click', onOk);
            el.removeEventListener('hidden.bs.modal', onHidden);
        }
        okBtn.addEventListener('click', onOk, { once: true });
        el.addEventListener('hidden.bs.modal', onHidden, { once: true });
        modal.show();
    });
}
async function showConfirm(message, opts = {}) {
    const { title = 'Confirmar', okText = 'Sí', cancelText = 'Cancelar' } = opts;
    const el = ensureUiModal();
    const hasBootstrap = !!window.bootstrap?.Modal;
    if (!hasBootstrap) return confirm(message);
    const modal = new bootstrap.Modal(el);
    const titleEl = document.getElementById('uiModalTitle');
    const bodyEl = document.getElementById('uiModalBody');
    const okBtn = document.getElementById('uiModalOk');
    const cancelBtn = document.getElementById('uiModalCancel');
    titleEl.textContent = title;
    bodyEl.innerHTML = String(message).replace(/\n/g, '<br>');
    cancelBtn.classList.remove('d-none');
    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;
    return new Promise(resolve => {
        let decided = false;
        const onOk = () => { decided = true; cleanup(); modal.hide(); resolve(true); };
        const onCancel = () => { decided = true; cleanup(); resolve(false); };
        const onHidden = () => { if (!decided) resolve(false); cleanup(); };
        function cleanup() {
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            el.removeEventListener('hidden.bs.modal', onHidden);
        }
        okBtn.addEventListener('click', onOk, { once: true });
        cancelBtn.addEventListener('click', onCancel, { once: true });
        el.addEventListener('hidden.bs.modal', onHidden, { once: true });
        modal.show();
    });
}

/* ===== Carrito / Resumen ===== */
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
function renderResumen() {
    const lista = document.getElementById('listaResumen');
    const total = document.getElementById('totalResumen');
    if (!lista || !total) return;
    lista.innerHTML = '';
    let totalCompra = 0;
    if (carrito.length === 0) {
        lista.innerHTML = '<li>Tu carrito está vacío.</li>';
        total.textContent = '0.00';
        return;
    }
    carrito.forEach((prod, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
      <span class="nombre">${prod.nombre} (x${prod.cantidad})</span>
      <div>
        $${(prod.precio * prod.cantidad).toFixed(2)}
        <button class="btn-eliminar" aria-label="Eliminar producto ${prod.nombre}" onclick="eliminarProducto(${index})">X</button>
      </div>
    `;
        lista.appendChild(li);
        totalCompra += prod.precio * prod.cantidad;
    });
    total.textContent = totalCompra.toFixed(2);
}
function eliminarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderResumen();
}
window.eliminarProducto = eliminarProducto;
function mostrarPopupExito() {
    const popup = document.getElementById('popup-exito');
    if (popup) popup.style.display = 'flex';
}
(function () {
    const popup = document.getElementById('popup-exito');
    if (!popup) return;
    const closeBtn = popup.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => popup.style.display = 'none');
})();

/* ===== Helpers de formato / payload ===== */
function formatARSPlain(n) {
    const num = Number(n) || 0;
    const s = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(num);
    return `ARS ${s}`;
}
function hhmmToEpochToday(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const now = new Date();
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    return dt.getTime();
}
function armarPayload(formValues, carrito) {
    const id = `W-${Date.now()}`;
    const itemsArr = (Array.isArray(carrito) ? carrito : []).map(it => {
        const qty = Number(it.cantidad ?? it.qty ?? 1);
        const unit = Number(it.precio ?? it.price ?? 0);
        return {
            name: it.nombre ?? it.name ?? 'Producto',
            qty,
            price: formatARSPlain(unit)
        };
    });
    const totalNumber = (Array.isArray(carrito) ? carrito : []).reduce((acc, it) => {
        const qty = Number(it.cantidad ?? it.qty ?? 1);
        const unit = Number(it.precio ?? it.price ?? 0);
        return acc + qty * unit;
    }, 0);
    const slotStart = hhmmToEpochToday(formValues.horaProgramada);
    return {
        id,
        status: 'PENDING',
        customerName: formValues.nombre,
        total: formatARSPlain(totalNumber),
        courier: 'PedidoWeb',
        phone: formValues.telefono,
        scheduledTime: formValues.horaProgramada || undefined,
        address: formValues.direccion,
        email: formValues.email,
        slotStart: slotStart || undefined,
        items: JSON.stringify(itemsArr)
    };
}

/* ===== Envío a webhook (anti doble click + modales bonitos) ===== */
const form = document.querySelector('main #checkoutForm');
const btnEnviarPedido = document.getElementById('btnEnviarPedido');
let sending = false;

btnEnviarPedido?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form || sending) return;
    sending = true;
    btnEnviarPedido.disabled = true;

    try {
        const nombre = form.nombre?.value.trim() || '';
        const direccion = form.direccion?.value.trim() || '';
        const telefono = form.telefono?.value.trim() || '';
        const horaProgramada = form.horaProgramada?.value || '';
        const email = form.email?.value.trim() || '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telRegex = /^[0-9]{8,15}$/;

        if (!nombre) { await showAlert('Por favor ingresa tu nombre completo.', { title: 'Dato requerido' }); form.nombre?.focus(); throw new Error('valid'); }
        if (!direccion) { await showAlert('Por favor ingresa tu dirección.', { title: 'Dato requerido' }); form.direccion?.focus(); throw new Error('valid'); }
        if (!telRegex.test(telefono)) { await showAlert('Teléfono inválido. Solo números, 8 a 15 dígitos.', { title: 'Dato requerido' }); form.telefono?.focus(); throw new Error('valid'); }
        if (!emailRegex.test(email)) { await showAlert('Por favor ingresa un email válido.', { title: 'Dato requerido' }); form.email?.focus(); throw new Error('valid'); }

        let carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
        if (!Array.isArray(carritoLS) || carritoLS.length === 0) {
            await showAlert('Tu carrito está vacío.', { title: 'Sin productos' });
            throw new Error('valid');
        }

        const ok = await showConfirm(
            'Esta opción solo está disponible con pago en efectivo o transferencia confirmada.\n\n' +
            'CVU: 00000000000000000000000\n' +
            'ALIAS: Birlik.Ros\n\n' +
            'Recibirás un mensaje confirmando la transferencia recibida al número ingresado.\n\n' +
            'Presiona "Continuar" si pagas en efectivo o si ya realizaste la transferencia.',
            { title: 'Enviar pedido', okText: 'Continuar', cancelText: 'Volver' }
        );
        if (!ok) throw new Error('cancel');

        const payload = armarPayload({ nombre, direccion, email, telefono, horaProgramada }, carritoLS);
        const resp = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => '');
            throw new Error(`HTTP ${resp.status} ${txt}`);
        }

        localStorage.removeItem('carrito');
        carrito = [];
        renderResumen?.();
        form.reset?.();
        mostrarPopupExito?.();
    } catch (err) {
        if (err?.message !== 'valid' && err?.message !== 'cancel') {
            console.error('Error enviando pedido:', err);
            await showAlert('No pudimos enviar el pedido. Intenta nuevamente en unos minutos.', { title: 'Error' });
        }
    } finally {
        sending = false;
        btnEnviarPedido.disabled = false;
    }
});

/* ===== Envío por WhatsApp (submit del form) ===== */
// ===== WhatsApp =====
const btnEnviarWhatsApp = document.getElementById('btnEnviarWhatsApp');

// Valida y devuelve los datos; si falta algo, muestra alerta y devuelve null
function tomarDatosForm(f) {
    const nombre = f.nombre?.value.trim() || '';
    const direccion = f.direccion?.value.trim() || '';
    const telefono = f.telefono?.value.trim() || '';
    const horaProgramada = f.horaProgramada?.value || '';
    const email = f.email?.value.trim() || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telRegex = /^[0-9]{8,15}$/;

    if (!nombre) { alert('Por favor ingresa tu nombre completo.'); f.nombre?.focus(); return null; }
    if (!direccion) { alert('Por favor ingresa tu dirección.'); f.direccion?.focus(); return null; }
    if (!telRegex.test(telefono)) { alert('Teléfono inválido. Solo números, 8 a 15 dígitos.'); f.telefono?.focus(); return null; }
    if (!emailRegex.test(email)) { alert('Por favor ingresa un email válido.'); f.email?.focus(); return null; }

    return { nombre, direccion, telefono, horaProgramada, email };
}

function abrirWhatsAppConPedido(datos, carritoLS) {
    let mensaje = `📦 *Pedido nuevo*%0A`;
    mensaje += `👤 Nombre: ${datos.nombre}%0A`;
    mensaje += `📍 Dirección: ${datos.direccion}%0A`;
    mensaje += `📧 Email: ${datos.email}%0A`;
    mensaje += `📱 Tel: ${datos.telefono}%0A`;
    if (datos.horaProgramada) mensaje += `⏰ Hora programada: ${datos.horaProgramada}%0A`;
    mensaje += `%0A🛒 *Productos:*%0A`;

    carritoLS.forEach(p => {
        const subtotal = (Number(p.precio) * Number(p.cantidad)).toFixed(2);
        mensaje += `• ${p.nombre} (x${p.cantidad}) - $${subtotal}%0A`;
    });

    const total = carritoLS.reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
    mensaje += `%0A💰 *Total:* $${total.toFixed(2)}`;

    const telefonoDestino = '5493412282254'; // <- tu número receptor con código país y sin signos
    const url = `https://wa.me/${telefonoDestino}?text=${mensaje}`;

    // Abrir en una pestaña nueva; al estar dentro del click, no lo bloquea
    window.open(url, '_blank');
}

// Click explícito en el botón
btnEnviarWhatsApp?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form) return;
    const datos = tomarDatosForm(form);
    if (!datos) return;

    const carritoLS = JSON.parse(localStorage.getItem('carrito') || '[]');
    if (!Array.isArray(carritoLS) || carritoLS.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de enviar el pedido.');
        return;
    }

    abrirWhatsAppConPedido(datos, carritoLS);

    // Limpieza de UI
    localStorage.removeItem('carrito');
    carrito = [];
    renderResumen?.();
    form.reset?.();
    mostrarPopupExito?.();
});

// Fallback: si el botón quedó como type="submit", usamos el submit del form
form?.addEventListener('submit', (e) => {
    e.preventDefault();
    btnEnviarWhatsApp?.click();
});


/* ===== Render inicial ===== */
renderResumen();