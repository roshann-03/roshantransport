const $ = selector => document.querySelector(selector);
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const status = $('#login-status');
    status.textContent = 'Signing in…';
    try {
      const data = Object.fromEntries(new FormData(loginForm).entries());
      await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
      location.href = 'dashboard.html';
    } catch (error) { status.textContent = error.message; }
  });
}

async function loadDashboard() {
  if (!$('#request-list')) return;
  try {
    await apiRequest('/api/auth/me');
  } catch { location.href = 'login.html'; return; }

  const filter = $('#request-filter');
  const render = async () => {
    const result = await apiRequest(`/api/admin/requests?type=${filter.value}`);
    $('#request-list').innerHTML = '';
    $('#total-count').textContent = result.requests.length;
    if (!result.requests.length) {
      $('#request-list').innerHTML = '<div class="empty-state">No requests found.</div>';
      return;
    }
    result.requests.forEach(item => {
      const article = document.createElement('article');
      article.className = 'request-card';
      const heading = document.createElement('div');
      heading.className = 'request-heading';
      const title = document.createElement('h3');
      title.textContent = `${item.kind === 'quote' ? 'Quote' : 'Support'} · ${item.name}`;
      const date = document.createElement('span');
      date.textContent = new Date(item.createdAt).toLocaleString();
      heading.append(title, date);
      const details = document.createElement('p');
      details.textContent = [item.company, item.email, item.phone, item.origin && `From: ${item.origin}`, item.destination && `To: ${item.destination}`, item.vehicleType && `Vehicle: ${item.vehicleType}`, item.load && `Material: ${item.load}`, item.weight && `Weight: ${item.weight}`, item.expectedFreight && `Expected freight: ₹${item.expectedFreight}`, item.loadingDate && `Loading date: ${item.loadingDate}`, item.subject, item.message].filter(Boolean).join(' · ');
      const controls = document.createElement('div');
      controls.className = 'request-controls';
      const state = document.createElement('select');
      ['new', 'in-progress', 'resolved'].forEach(value => {
        const option = document.createElement('option');
        option.value = value; option.textContent = value.replace('-', ' ');
        option.selected = item.status === value;
        state.append(option);
      });
      state.addEventListener('change', async () => {
        try {
          await apiRequest(`/api/admin/requests/${item.kind}/${item._id}`, {
            method: 'PATCH', body: JSON.stringify({ status: state.value })
          });
        } catch (error) { alert(error.message); }
      });
      const badge = document.createElement('span');
      badge.className = `status-pill ${item.status}`;
      badge.textContent = item.status;
      controls.append(badge, state);
      article.append(heading, details, controls);
      $('#request-list').append(article);
    });
  };
  filter.addEventListener('change', render);
  $('#logout').addEventListener('click', async () => {
    await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' });
    location.href = 'login.html';
  });
  $('#refresh').addEventListener('click', render);
  render().catch(error => { $('#request-list').textContent = error.message; });
}
loadDashboard();
