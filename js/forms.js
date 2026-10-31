
const MAX_SHIPMENTS = 10;

document.querySelectorAll('[data-api-form]').forEach(form => {
  const shipmentsList = form.querySelector('#shipmentsList');
  const addButton = form.querySelector('#addShipment');
  const template = form.querySelector('#shipmentTemplate');

  function updateShipmentNumbers() {
    const cards = [...shipmentsList.querySelectorAll('.shipment-card')];

    cards.forEach((card, index) => {
      card.querySelector('.shipment-number').textContent =
        `Transport ${index + 1}`;

      // Keep field names sequential after adding/removing cards.
      card.querySelectorAll('[name]').forEach(field => {
        field.name = field.name.replace(
          /shipments\[\d+\]/,
          `shipments[${index}]`
        );
      });
    });

    if (addButton) {
      addButton.disabled = cards.length >= MAX_SHIPMENTS;
    }

    cards.forEach(card => {
      const removeButton = card.querySelector('.remove-shipment');
      if (removeButton) {
        removeButton.disabled = cards.length === 1;
      }
    });
  }

  function addShipment() {
    const count = shipmentsList.querySelectorAll('.shipment-card').length;

    if (count >= MAX_SHIPMENTS || !template) return;

    const html = template.innerHTML
      .replaceAll('__INDEX__', count)
      .replaceAll('__NUMBER__', count + 1);

    shipmentsList.insertAdjacentHTML('beforeend', html);
    updateShipmentNumbers();
  }

  addButton?.addEventListener('click', addShipment);

  shipmentsList?.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-shipment');

    if (!removeButton) return;

    const cards = shipmentsList.querySelectorAll('.shipment-card');

    if (cards.length > 1) {
      removeButton.closest('.shipment-card').remove();
      updateShipmentNumbers();
    }
  });

  function getValue(container, selector) {
    return container.querySelector(selector)?.value.trim() || '';
  }

  function getLocation(card, type) {
    const location = card.querySelector(`.${type}-location`);

    return {
      state: getValue(location, '[name$="[state]"]'),
      city: getValue(location, '[name$="[city]"]'),
      locality: getValue(location, '[name$="[locality]"]'),
      pincode: getValue(location, '[name$="[pincode]"]')
    };
  }

  function getShipmentData(card) {
    return {
      pickup: getLocation(card, 'pickup'),
      delivery: getLocation(card, 'delivery'),
      cargo: getValue(card, '[name$="[cargo]"]'),
      weight: getValue(card, '[name$="[weight]"]'),
      vehicleType: getValue(card, '[name$="[vehicleType]"]'),
      loadingDate: getValue(card, '[name$="[loadingDate]"]')
    };
  }

  function serializeForm() {
    const formData = new FormData(form);

    return {
      name: formData.get('name')?.trim() || '',
      company: formData.get('company')?.trim() || '',
      phone: formData.get('phone')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      whatsappAvailable: form.querySelector(
        '[name="whatsappAvailable"]'
      )?.checked || false,

      shipments: [...shipmentsList.querySelectorAll('.shipment-card')]
        .map(getShipmentData),

      message: formData.get('message')?.trim() || ''
    };
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');

    if (!form.reportValidity()) return;

    const cards = shipmentsList.querySelectorAll('.shipment-card');

    if (!cards.length || cards.length > MAX_SHIPMENTS) {
      status.textContent = 'Please provide between 1 and 10 shipments.';
      status.className = 'form-status error';
      return;
    }

    updateShipmentNumbers();

    status.textContent = 'Sending your request…';
    status.className = 'form-status';
    submit.disabled = true;

    try {
      const data = serializeForm();

      await apiRequest(form.dataset.apiForm, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      status.textContent =
        'Thank you. Your request has been received. Our team will contact you shortly.';

      status.classList.add('success');

      form.reset();

      // Keep only the first shipment card after successful submission.
      const shipmentCards = shipmentsList.querySelectorAll('.shipment-card');

      shipmentCards.forEach((card, index) => {
        if (index > 0) card.remove();
      });

      updateShipmentNumbers();

    } catch (error) {
      status.textContent = error.message || 'Something went wrong.';
      status.classList.add('error');

    } finally {
      submit.disabled = false;
    }
  });

  updateShipmentNumbers();
});
