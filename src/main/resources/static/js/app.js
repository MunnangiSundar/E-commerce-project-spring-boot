const apiUrl = '/api/products';
let products = [];
let cart = [];
let categories = ["Electronics", "Clothing", "Home", "Books"];

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
    populateCategoryFilter();
});

// ---------- FETCH PRODUCTS ----------
function fetchProducts() {
    axios.get(apiUrl)
        .then(res => {
            products = res.data;
            renderProducts(products);
        })
        .catch(err => console.error(err));
}

// ---------- RENDER PRODUCTS ----------
function renderProducts(productsList) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    if(productsList.length === 0){
        grid.innerHTML = `<p class="text-center">No products found.</p>`;
        return;
    }

    productsList.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-3 mb-4';
        const discountBadge = product.discount && product.discount > 0 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${product.discount}%</span>` : '';
        const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));

        card.innerHTML = `
            <div class="card shadow-sm position-relative">
                ${discountBadge}
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="fw-bold">₹ ${product.price}</p>
                    <p class="text-warning">${stars}</p>
                    <p class="text-muted">${product.category || ''}</p>
                    <div class="d-flex justify-content-between mt-2">
                        <button class="btn btn-sm btn-warning me-2" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                        <button class="btn btn-sm btn-success" onclick="addToCart(${product.id})">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ---------- CART ----------
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;

    const existing = cart.find(p => p.id === id);
    if(existing) existing.quantity += 1;
    else cart.push({...product, quantity: 1});

    updateCartUI();
}

function updateCartUI() {
    const cartSidebar = document.getElementById('cartSidebar');
    if(!cartSidebar) return;

    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div class="mb-2 border-bottom pb-1">
                <p>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</p>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    });

    cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartTotal.textContent = total;
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

function checkout() {
    alert("Checkout functionality can be implemented with backend!");
}

// ---------- SEARCH & FILTER ----------
function searchProduct(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
}

function filterProducts() {
    const name = document.getElementById('filterName').value.toLowerCase();
    const min = parseFloat(document.getElementById('filterMinPrice').value) || 0;
    const max = parseFloat(document.getElementById('filterMaxPrice').value) || Infinity;
    const category = document.getElementById('filterCategory').value;

    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(name) &&
        p.price >= min && p.price <= max &&
        (category === '' || p.category === category)
    );
    renderProducts(filtered);
}

function resetFilter() {
    document.getElementById('filterName').value = '';
    document.getElementById('filterMinPrice').value = '';
    document.getElementById('filterMaxPrice').value = '';
    document.getElementById('filterCategory').value = '';
    renderProducts(products);
}

// ---------- MODAL & CRUD ----------
const modal = document.getElementById('productModal');

function openModal() {
    modal.style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

function closeModal() { modal.style.display = 'none'; }

function populateCategoryFilter() {
    const select = document.getElementById('filterCategory');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory')?.value || "Electronics";
    const discount = parseInt(document.getElementById('productDiscount')?.value) || 0;
    const rating = parseFloat(document.getElementById('productRating')?.value) || 0;

    const productData = { name, description, price, category, discount, rating };

    if(id) axios.put(`${apiUrl}/${id}`, productData)
        .then(res => { fetchProducts(); closeModal(); })
        .catch(err => alert(err));
    else axios.post(apiUrl, productData)
        .then(res => { fetchProducts(); closeModal(); })
        .catch(err => alert(err));
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    if(document.getElementById('productCategory')) document.getElementById('productCategory').value = product.category;
    if(document.getElementById('productDiscount')) document.getElementById('productDiscount').value = product.discount || 0;
    if(document.getElementById('productRating')) document.getElementById('productRating').value = product.rating || 0;

    modal.style.display = 'block';
}

function deleteProduct(id) {
    if(!confirm('Are you sure to delete this product?')) return;
    axios.delete(`${apiUrl}/${id}`).then(res => fetchProducts()).catch(err => alert(err));
}

window.onclick = function(event) { if(event.target == modal) closeModal(); }
