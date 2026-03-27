const STORAGE_KEYS = {
  vehicles: "carSaleWebVehicles",
  customers: "carSaleWebCustomers",
  purchases: "carSaleWebPurchases",
};

const state = {
  vehicles: loadData(STORAGE_KEYS.vehicles),
  customers: loadData(STORAGE_KEYS.customers),
  purchases: loadData(STORAGE_KEYS.purchases),
};

const refs = {
  vehicleForm: document.getElementById("vehicle-form"),
  customerForm: document.getElementById("customer-form"),
  purchaseForm: document.getElementById("purchase-form"),
  vehicleList: document.getElementById("vehicle-list"),
  customerList: document.getElementById("customer-list"),
  purchaseList: document.getElementById("purchase-list"),
  customerSelect: document.getElementById("purchase-customer"),
  vehicleSelect: document.getElementById("purchase-vehicle"),
  itemTemplate: document.getElementById("item-template"),
};

function loadData(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(state.vehicles));
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(state.customers));
  localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(state.purchases));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createItem(content) {
  const item = refs.itemTemplate.content.firstElementChild.cloneNode(true);
  item.textContent = content;
  return item;
}

function renderList(target, items, mapper) {
  target.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "item empty";
    empty.textContent = "No records yet.";
    target.appendChild(empty);
    return;
  }

  items.forEach((item) => target.appendChild(createItem(mapper(item))));
}

function renderSelect(select, items, placeholder, mapper) {
  select.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = placeholder;
  select.appendChild(blank);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = mapper(item);
    select.appendChild(option);
  });
}

function render() {
  renderList(
    refs.vehicleList,
    state.vehicles,
    (vehicle) => `${vehicle.brand} ${vehicle.model} - $${vehicle.price}`
  );

  renderList(
    refs.customerList,
    state.customers,
    (customer) => `${customer.name} (${customer.email}, ${customer.phone})`
  );

  renderList(refs.purchaseList, state.purchases, (purchase) => {
    const customer = state.customers.find((entry) => entry.id === purchase.customerId);
    const vehicle = state.vehicles.find((entry) => entry.id === purchase.vehicleId);
    return `${customer?.name ?? "Unknown customer"} bought ${vehicle?.brand ?? "Unknown"} ${vehicle?.model ?? "vehicle"} for $${purchase.price}`;
  });

  renderSelect(refs.customerSelect, state.customers, "Choose a customer", (customer) => customer.name);
  renderSelect(refs.vehicleSelect, state.vehicles, "Choose a vehicle", (vehicle) => `${vehicle.brand} ${vehicle.model} ($${vehicle.price})`);
}

refs.vehicleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(refs.vehicleForm);

  const model = formData.get("vehicle-model") || document.getElementById("vehicle-model").value;
  const brand = formData.get("vehicle-brand") || document.getElementById("vehicle-brand").value;
  const price = Number(formData.get("vehicle-price") || document.getElementById("vehicle-price").value);

  state.vehicles.push({
    id: uid("vehicle"),
    model: String(model).trim(),
    brand: String(brand).trim(),
    price,
  });

  persist();
  refs.vehicleForm.reset();
  render();
});

refs.customerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(refs.customerForm);

  const name = formData.get("customer-name") || document.getElementById("customer-name").value;
  const email = formData.get("customer-email") || document.getElementById("customer-email").value;
  const phone = formData.get("customer-phone") || document.getElementById("customer-phone").value;

  state.customers.push({
    id: uid("customer"),
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
  });

  persist();
  refs.customerForm.reset();
  render();
});

refs.purchaseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const customerId = refs.customerSelect.value;
  const vehicleId = refs.vehicleSelect.value;

  if (!customerId || !vehicleId) {
    return;
  }

  const vehicle = state.vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle) {
    return;
  }

  state.purchases.push({
    id: uid("purchase"),
    customerId,
    vehicleId,
    price: vehicle.price,
    purchasedAt: new Date().toISOString(),
  });

  persist();
  refs.purchaseForm.reset();
  render();
});

render();
