// API Configuration
const API_URL = 'http://localhost:5000';
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allBooks = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  // Load page-specific content
  const homeSection = document.getElementById('homeSection');
  const authSection = document.getElementById('authSection');
  const booksSection = document.getElementById('booksSection');
  const cartSection = document.getElementById('cartSection');
  const ordersSection = document.getElementById('ordersSection');
  const adminSection = document.getElementById('adminSection');
  
  if (homeSection) {
    loadBooks();
    displayHomeFeaturedBooks();
  }
  
  if (booksSection) {
    loadBooks();
  }
  
  if (cartSection) {
    displayCart();
  }
  
  if (ordersSection) {
    if (!authToken) {
      alert('Please login first');
      window.location.href = 'login.html';
    } else {
      loadOrders();
    }
  }
  
  if (adminSection) {
    if (!authToken || !currentUser || currentUser.role !== 'admin') {
      alert('Admin access required');
      window.location.href = 'index.html';
    } else {
       loadAdminBooks();
      loadAdminOrders();
    }
  }
});

function showAuthTab(tab) {
  if (tab === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
  } else {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
  }
}

// ============= Authentication =============
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');

  // Validate inputs
  if (!email || !password) {
    loginError.textContent = 'Email and password are required';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Verify we got a token
    if (!data.token) {
      throw new Error('No authentication token received');
    }
    
    authToken = data.token;
    currentUser = data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('loginForm').reset();
    loginError.textContent = '';
    alert(`Welcome back, ${currentUser.username}!`);
    updateUI();
    window.location.href = 'books.html';
  } catch (error) {
    console.error('Login error:', error);
    loginError.textContent = error.message || 'Login failed. Please check your credentials.';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const address = document.getElementById('registerAddress').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();

  // Validate inputs
  if (!username || !email || !password) {
    document.getElementById('registerError').textContent = 'Username, email, and password are required';
    return;
  }

  if (password.length < 6) {
    document.getElementById('registerError').textContent = 'Password must be at least 6 characters';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, address, phone })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    authToken = data.token;
    currentUser = data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Clear form
    document.getElementById('registerForm').reset();
    document.getElementById('registerError').textContent = '';
    alert('Registration successful!');
    updateUI();
    window.location.href = 'books.html';
  } catch (error) {
    console.error('Registration error:', error);
    document.getElementById('registerError').textContent = error.message || 'Registration failed. Please try again.';
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  cart = [];
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  updateUI();
  window.location.href = 'index.html';
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDisplay = document.getElementById('userDisplay');
  const ordersLink = document.getElementById('ordersLink');
  const adminLink = document.getElementById('adminLink');

  if (authToken && currentUser) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    userDisplay.style.display = 'inline-block';
    userDisplay.textContent = `Hello, ${currentUser.username}!`;
    ordersLink.style.display = 'inline-block';
    
    // Show admin link only for admins
    if (currentUser.role === 'admin') {
      adminLink.style.display = 'inline-block';
    } else {
      adminLink.style.display = 'none';
    }
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    userDisplay.style.display = 'none';
    ordersLink.style.display = 'none';
    adminLink.style.display = 'none';
  }
  updateCartDisplay();
}

// ============= Books =============
async function loadBooks() {
  try {
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error('Failed to load books');
    allBooks = await response.json();
    displayBooks(allBooks);
  } catch (error) {
    console.error('Error loading books:', error);
    document.getElementById('booksList').innerHTML = '<p class="empty-message">Failed to load books. Make sure the server is running.</p>';
  }
}

function displayHomeFeaturedBooks() {
  const homeBooksList = document.getElementById('homeBooksList');
  if (!homeBooksList) return;
  
  if (allBooks.length === 0) {
    homeBooksList.innerHTML = '<p class="empty-message" style="grid-column: 1/-1;">No books available.</p>';
    return;
  }

  // Show first 8 books as featured
  const featuredBooks = allBooks.slice(0, 8);
  homeBooksList.innerHTML = featuredBooks.map(book => `
    <div class="book-card">
      <div class="book-image">📖</div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div class="book-price">${book.price} EGP</div>
        <div class="book-rating">⭐ ${book.rating ? book.rating.toFixed(1) : 'N/A'} (${book.reviewsCount} reviews)</div>
        <div class="book-stock">Stock: ${book.stock > 0 ? book.stock : 'Out of Stock'}</div>
        <div class="book-actions">
          <button class="btn btn-primary btn-small" onclick="addToCart('${book._id}', '${book.title}', ${book.price}, '${book.image}')" ${book.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

function displayBooks(books) {
  const booksList = document.getElementById('booksList');
  if (books.length === 0) {
    booksList.innerHTML = '<p class="empty-message">No books found.</p>';
    return;
  }

  booksList.innerHTML = books.map(book => `
    <div class="book-card">
      <div class="book-image">📖</div>
      <div class="book-info">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
        <div class="book-price">${book.price} EGP</div>
        <div class="book-rating">⭐ ${book.rating ? book.rating.toFixed(1) : 'N/A'} (${book.reviewsCount} reviews)</div>
        <div class="book-stock">Stock: ${book.stock > 0 ? book.stock : 'Out of Stock'}</div>
        <div class="book-actions">
          <button class="btn btn-primary btn-small" onclick="addToCart('${book._id}', '${book.title}', ${book.price}, '${book.image}')" ${book.stock === 0 ? 'disabled' : ''}>Add to Cart</button>

        </div>
      </div>
    </div>
  `).join('');
}

function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm)
  );
  displayBooks(filtered);
}

function handleSort() {
  const sortValue = document.getElementById('sortSelect').value;
  let sorted = [...allBooks];

  if (sortValue === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortValue === 'popularity') {
    sorted.sort((a, b) => b.popularity - a.popularity);
  } else if (sortValue === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);
  }

  displayBooks(sorted);
}

// ============= Cart =============
function addToCart(bookId, title, price, image) {
  if (!authToken) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  // Find the book to check stock
  const book = allBooks.find(b => b._id === bookId);
  if (!book || book.stock <= 0) {
    alert('This book is out of stock!');
    return;
  }

  const existingItem = cart.find(item => item.bookId === bookId);
  
  if (existingItem) {
    // Check if adding more would exceed stock
    if (existingItem.quantity >= book.stock) {
      alert(`Only ${book.stock} in stock. Cannot add more.`);
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({
      bookId,
      title,
      price,
      image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
  alert('Added to cart!');
}

function removeFromCart(bookId) {
  cart = cart.filter(item => item.bookId !== bookId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
  displayCart();
}

function updateQuantity(bookId, quantity) {
  const item = cart.find(item => item.bookId === bookId);
  const book = allBooks.find(b => b._id === bookId);
  
  if (item) {
    // Ensure quantity doesn't exceed available stock
    const validQuantity = Math.min(Math.max(1, quantity), book ? book.stock : quantity);
    if (validQuantity !== quantity && book) {
      alert(`Only ${book.stock} available in stock.`);
    }
    item.quantity = validQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    displayCart();
  }
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cartCount');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function displayCart() {
  const cartContent = document.getElementById('cartContent');
  
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-message">
        <p>Your cart is empty</p>
        <a href="books.html" class="btn btn-primary" style="display: inline-block; margin-top: 20px; text-decoration: none;">Continue Shopping</a>
      </div>
    `;
    return;
  }

  let cartHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">📖</div>
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-price">${item.price} EGP</div>
        <div class="cart-item-quantity">
          <button class="btn btn-secondary quantity-btn" onclick="updateQuantity('${item.bookId}', ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button class="btn btn-secondary quantity-btn" onclick="updateQuantity('${item.bookId}', ${item.quantity + 1})">+</button>
          <button class="btn btn-danger btn-small" onclick="removeFromCart('${item.bookId}')" style="margin-left: auto;">Remove</button>
        </div>
      </div>
      <div style="font-weight: bold; min-width: 100px; text-align: right;">
        ${(item.price * item.quantity).toFixed(2)} EGP
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const checkoutButton = authToken ? 
    `<button class="btn btn-primary" onclick="checkout()" style="width: 100%; margin-top: 20px; padding: 15px;">Place Order</button>` :
    `<button class="btn btn-primary" onclick="window.location.href='login.html'" style="width: 100%; margin-top: 20px; padding: 15px;">Login to Checkout</button>`;

  cartHTML += `
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${total.toFixed(2)} EGP</span>
      </div>
      <div class="summary-row">
        <span>Shipping:</span>
        <span>Free</span>
      </div>
      <div class="summary-total">
        Total: ${total.toFixed(2)} EGP
      </div>
      ${checkoutButton}
    </div>
  `;

  cartContent.innerHTML = cartHTML;
}

async function checkout() {
  if (!authToken || cart.length === 0) {
    alert('Please add items to cart first');
    return;
  }

  if (!currentUser) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Format items properly
    const orderItems = cart.map(item => ({
      bookId: item.bookId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image || ''
    }));

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ items: orderItems })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to place order');
    }

    const order = await response.json();
    alert('Order placed successfully!');
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    await loadBooks();
    window.location.href = 'orders.html';
  } catch (error) {
    alert('Failed to place order: ' + error.message);
    console.error('Checkout error:', error);
  }
}

// ============= Orders =============
async function loadOrders() {
  if (!authToken || !currentUser) return;

  try {
    const response = await fetch(`${API_URL}/orders/user/${currentUser._id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to load orders');

    const orders = await response.json();
    displayOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('ordersList').innerHTML = '<p class="empty-message">Failed to load orders</p>';
  }
}

function displayOrders(orders) {
  const ordersList = document.getElementById('ordersList');
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-message">No orders yet</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">Order #${order._id.substring(0, 8)}</div>
          <div class="order-date">Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
        </div>
        <div class="order-status status-${order.status}">${order.status.toUpperCase()}</div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.title} x ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} EGP</span>
          </div>
        `).join('')}
      </div>
      <div class="order-total">Total: ${order.totalPrice.toFixed(2)} EGP</div>
      ${order.status === 'pending' ? `
        <button class="btn btn-danger btn-small" onclick="cancelOrder('${order._id}')" style="margin-top: 15px;">Cancel Order</button>
      ` : ''}
    </div>
  `).join('');
}

async function cancelOrder(orderId) {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Cancel failed');

    alert('Order cancelled');
    loadOrders();
  } catch (error) {
    alert('Failed to cancel order: ' + error.message);
  }
}

// ============= Admin Dashboard =============
function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  
  if (tab === 'books') {
    document.getElementById('booksManagementTab').classList.add('active');
    document.querySelectorAll('.admin-tab')[0].classList.add('active');
    loadAdminBooks();
  } else {
    document.getElementById('ordersManagementTab').classList.add('active');
    document.querySelectorAll('.admin-tab')[1].classList.add('active');
    loadAdminOrders();
  }
}

async function loadAdminBooks() {
  try {
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error('Failed to load books');
    const books = await response.json();
    displayAdminBooks(books);
  } catch (error) {
    console.error('Error loading books:', error);
    document.getElementById('adminBooksList').innerHTML = '<p class="empty-message">Failed to load books</p>';
  }
}

function displayAdminBooks(books) {
  const list = document.getElementById('adminBooksList');
  list.innerHTML = books.map(book => `
    <div class="admin-book-item">
      <div class="admin-book-item-title">${book.title}</div>
      <div>${book.author} • Price: ${book.price} EGP • Stock: ${book.stock}</div>
      <div>Rating: ${book.rating}</div>
      <div>Popularity: ${book.popularity}</div>
      <div class="admin-book-item-actions">
        <button class="btn btn-secondary btn-small" onclick="editBookModal('${book._id}', '${book.title}', '${book.author}', ${book.price}, ${book.stock}, '${book.description || ''}', ${book.rating}, ${book.popularity})">Edit</button>
        <button class="btn btn-danger btn-small" onclick="deleteBook('${book._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function handleAddBook(event) {
  event.preventDefault();

  const bookData = {
    title: document.getElementById('newBookTitle').value,
    author: document.getElementById('newBookAuthor').value,
    price: parseFloat(document.getElementById('newBookPrice').value),
    stock: parseInt(document.getElementById('newBookStock').value),
    description: document.getElementById('newBookDescription').value,
    rating: parseFloat(document.getElementById('newBookRating').value)
  };

  try {
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Failed to add book');

    alert('Book added successfully!');
    document.getElementById('addBookForm').reset();
    document.getElementById('addBookError').textContent = '';
    loadAdminBooks();
  } catch (error) {
    document.getElementById('addBookError').textContent = 'Error: ' + error.message;
  }
}

async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book?')) return;

  try {
    const response = await fetch(`${API_URL}/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to delete book');

    alert('Book deleted successfully!');
    loadAdminBooks();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function editBookModal(bookId, title, author, price, stock, description, rating, popularity = 0) {
  // Store the book ID for saving later
  window.currentEditBookId = bookId;
  
  // Populate the form with current values
  document.getElementById('editBookTitle').value = title;
  document.getElementById('editBookAuthor').value = author;
  document.getElementById('editBookPrice').value = price;
  document.getElementById('editBookStock').value = stock;
  document.getElementById('editBookDescription').value = description || '';
  document.getElementById('editBookRating').value = rating || 0;
  document.getElementById('editBookPopularity').value = popularity || 0;
  document.getElementById('editBookError').textContent = '';
  
  // Show the modal
  const modal = document.getElementById('editBookModal');
  modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('editBookModal');
  modal.classList.remove('active');
  window.currentEditBookId = null;
}

async function handleEditBook(event) {
  event.preventDefault();

  if (!window.currentEditBookId) {
    alert('Error: No book selected');
    return;
  }

  const bookData = {
    title: document.getElementById('editBookTitle').value,
    author: document.getElementById('editBookAuthor').value,
    price: parseFloat(document.getElementById('editBookPrice').value),
    stock: parseInt(document.getElementById('editBookStock').value),
    description: document.getElementById('editBookDescription').value,
    rating: parseFloat(document.getElementById('editBookRating').value),
    popularity: parseFloat(document.getElementById('editBookPopularity').value)
  };

  try {
    const response = await fetch(`${API_URL}/books/${window.currentEditBookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Failed to update book');

    alert('Book updated successfully!');
    closeEditModal();
    loadAdminBooks();
  } catch (error) {
    document.getElementById('editBookError').textContent = 'Error: ' + error.message;
  }
}

async function loadAdminOrders() {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to load orders');

    const orders = await response.json();
    displayAdminOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('adminOrdersList').innerHTML = '<p class="empty-message">Failed to load orders</p>';
  }
}

function displayAdminOrders(orders) {
  const list = document.getElementById('adminOrdersList');
  
  if (orders.length === 0) {
    list.innerHTML = '<p class="empty-message">No orders found</p>';
    return;
  }

  list.innerHTML = orders.map(order => `
    <div class="admin-order-item">
      <div class="admin-order-header">
        <div>
          <div style="font-weight: bold; margin-bottom: 5px;">Order #${order._id.substring(0, 8)}</div>
          <div style="font-size: 14px; color: #666;">
            Customer: ${order.userId ? order.userId.username : 'Unknown'} | 
            Date: ${new Date(order.orderDate).toLocaleDateString()}
          </div>
        </div>
        <select onchange="updateOrderStatus('${order._id}', this.value)" class="btn">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
      <div class="admin-order-items">
        ${order.items.map(item => `
          <div class="admin-order-item-row">
            <span>${item.title} x ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} EGP</span>
          </div>
        `).join('')}
      </div>
      <div style="text-align: right; font-weight: bold; padding-top: 10px; border-top: 1px solid #ddd;">
        Total: ${order.totalPrice.toFixed(2)} EGP
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update order');

    alert('Order status updated!');
    loadAdminOrders();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}
