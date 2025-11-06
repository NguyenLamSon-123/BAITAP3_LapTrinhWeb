// --- 1. ĐỊNH NGHĨA BIẾN VÀ LẤY ELEMENTS ---
const appContainer = document.getElementById('app-container');
const categoryLinksContainer = document.getElementById('category-links');
const userNavContainer = document.getElementById('user-nav');
const cartCountElement = document.getElementById('cart-count');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

// Địa chỉ API của Node-RED
const API_URL = 'http://127.0.0.1:1880/api';

// Biến toàn cục để lưu giỏ hàng
let cart = [];

// --- 2. CÁC HÀM "VẼ" GIAO DIỆN (RENDER) ---

/**
 * Hàm "vẽ" một danh sách sản phẩm ra màn hình
 * (Dùng cho Trang chủ, Trang nhóm, Trang tìm kiếm)
 */
function renderProductList(products) {
    if (products.length === 0) {
        appContainer.innerHTML = '<h2>Không tìm thấy sản phẩm nào.</h2>';
        return;
    }

    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="httpsT://via.placeholder.com/150" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <p class="price">${product.price.toLocaleString('vi-VN')} VNĐ</p>
            <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Thêm vào giỏ</button>
        `;
        productGrid.appendChild(productCard);
    });

    appContainer.innerHTML = ''; // Xoá nội dung "Đang tải..."
    appContainer.appendChild(productGrid);
}

/**
 * Hàm "vẽ" trang chủ (Sản phẩm bán chạy)
 */
async function renderHomePage() {
    appContainer.innerHTML = '<h2>Sản phẩm bán chạy</h2>';
    const response = await fetch(`${API_URL}/products/bestsellers`);
    const products = await response.json();
    renderProductList(products);
}

/**
 * Hàm "vẽ" sản phẩm theo nhóm
 */
async function renderCategoryPage(categoryId) {
    appContainer.innerHTML = '<h2>Đang tải sản phẩm...</h2>';
    const response = await fetch(`${API_URL}/products/category/${categoryId}`);
    const products = await response.json();
    renderProductList(products);
}

/**
 * Hàm "vẽ" kết quả tìm kiếm
 */
async function renderSearchPage(query) {
    appContainer.innerHTML = `<h2>Kết quả tìm kiếm cho: "${query}"</h2>`;
    const response = await fetch(`${API_URL}/products/search?q=${query}`);
    const products = await response.json();
    renderProductList(products);
}

/**
 * Hàm "vẽ" các nhóm sản phẩm ra thanh Nav
 */
async function renderCategoriesNav() {
    const response = await fetch(`${API_URL}/categories`);
    const categories = await response.json();
    
    categoryLinksContainer.innerHTML = ''; // Xoá
    categories.forEach(category => {
        // Dùng hash-routing
        categoryLinksContainer.innerHTML += `<a href="#category/${category.id}">${category.name}</a>`;
    });
}

/**
 * Hàm "vẽ" trang đăng nhập
 */
function renderLoginPage() {
    appContainer.innerHTML = `
        <h2>Đăng Nhập</h2>
        <form id="login-form">
            <div>
                <label>Tên đăng nhập:</label>
                <input type="text" id="login-username" value="admin" required>
            </div>
            <div>
                <label>Mật khẩu:</label>
                <input type="password" id="login-password" value="admin123" required>
            </div>
            <button type="submit">Đăng nhập</button>
        </form>
    `;
    
    // Gắn sự kiện submit cho form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

/**
 * Hàm "vẽ" trang Giỏ hàng
 */
function renderCartPage() {
    if (cart.length === 0) {
        appContainer.innerHTML = '<h2>Giỏ hàng của bạn đang trống.</h2>';
        return;
    }

    let totalAmount = 0;
    let cartHTML = '<h2>Giỏ Hàng</h2>';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        cartHTML += `
            <div class="cart-item">
                <span>${item.name} (SL: ${item.quantity})</span>
                <span>${itemTotal.toLocaleString('vi-VN')} VNĐ</span>
                <button onclick="removeFromCart(${index})">Xoá</button>
            </div>
        `;
    });

    cartHTML += `<h3>Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} VNĐ</h3>`;
    
    // Kiểm tra xem đã đăng nhập chưa
    if (getToken()) {
        cartHTML += `
            <form id="checkout-form">
                <h3>Thông tin giao hàng</h3>
                <div><label>Tên người nhận:</label><input type="text" id="shipping-name" required></div>
                <div><label>Số điện thoại:</label><input type="tel" id="shipping-phone" required></div>
                <div><label>Địa chỉ:</label><input type="text" id="shipping-address" required></div>
                <button type="submit">Xác nhận Đặt Hàng</button>
            </form>
        `;
    } else {
        cartHTML += `<p>Vui lòng <a href="#login">đăng nhập</a> để đặt hàng.</p>`;
    }

    appContainer.innerHTML = cartHTML;

    // Gắn sự kiện submit cho form đặt hàng (nếu có)
    if (document.getElementById('checkout-form')) {
        document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    }
}

/**
 * Hàm "vẽ" khu vực Đăng nhập/Logout (trên Header)
 */
function renderUserNav() {
    const token = getToken();
    if (token) {
        // Nếu có token, ta "giả định" đã đăng nhập
        // Bạn có thể thêm 1 API /api/me để lấy tên user từ token
        userNavContainer.innerHTML = `
            <span>Xin chào, User!</span>
            <a href="#" id="logout-button">Đăng xuất</a>
        `;
        document.getElementById('logout-button').addEventListener('click', handleLogout);
    } else {
        userNavContainer.innerHTML = `<a href="#login">Đăng nhập</a>`;
    }
}


// --- 3. CÁC HÀM XỬ LÝ SỰ KIỆN (LOGIC) ---

/**
 * Hàm xử lý chính: "Router" (Điều hướng trang)
 * Quyết định "vẽ" trang nào dựa trên URL (dấu #)
 */
function handleRouting() {
    const hash = window.location.hash;

    if (hash.startsWith('#category/')) {
        const categoryId = hash.split('/')[1];
        renderCategoryPage(categoryId);
    } else if (hash.startsWith('#search/')) {
        const query = hash.split('/')[1];
        renderSearchPage(decodeURIComponent(query));
    } else if (hash === '#login') {
        renderLoginPage();
    } else if (hash === '#cart') {
        renderCartPage();
    } else {
        // Mặc định là trang chủ
        renderHomePage();
    }
}

/**
 * Xử lý sự kiện bấm nút Tìm kiếm
 */
function handleSearch() {
    const query = searchInput.value;
    if (query) {
        // Đổi hash để kích hoạt router
        window.location.hash = `#search/${encodeURIComponent(query)}`;
    }
}

/**
 * Xử lý sự kiện Submit Form Login
 */
async function handleLogin(event) {
    event.preventDefault(); // Ngăn form tải lại trang
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success && result.token) {
        // LƯU PHIÊN ĐĂNG NHẬP (Yêu cầu đề bài)
        // Chúng ta lưu token vào Cookie
        document.cookie = `session_token=${result.token}; max-age=2592000; path=/`; // 30 ngày
        
        alert('Đăng nhập thành công!');
        // Tải lại toàn bộ để cập nhật trạng thái
        window.location.hash = '#home';
        location.reload(); 
    } else {
        alert(result.message || 'Đăng nhập thất bại.');
    }
}

/**
 * Xử lý sự kiện bấm Đăng xuất
 */
function handleLogout(event) {
    event.preventDefault();
    // Xoá cookie bằng cách cho nó hết hạn
    document.cookie = 'session_token=; max-age=-1; path=/';
    alert('Đã đăng xuất!');
    location.reload();
}

/**
 * Xử lý sự kiện Submit Form Đặt Hàng
 */
async function handleCheckout(event) {
    event.preventDefault();
    const token = getToken();
    if (!token) {
        alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
        window.location.hash = '#login';
        return;
    }

    // 1. Lấy thông tin giao hàng
    const shippingInfo = {
        name: document.getElementById('shipping-name').value,
        phone: document.getElementById('shipping-phone').value,
        address: document.getElementById('shipping-address').value,
    };

    // 2. Chuẩn bị giỏ hàng (frontend gửi lên cả giá tiền)
    const cartPayload = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price // Gửi giá lúc mua
    }));

    // 3. Gọi API Đặt Hàng (POST /api/orders)
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Gửi token để xác thực
        },
        body: JSON.stringify({
            shippingInfo: shippingInfo,
            cart: cartPayload
        })
    });

    const result = await response.json();

    if (result.success) {
        alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${result.orderId}`);
        // Xoá giỏ hàng
        cart = [];
        saveCartToLocalStorage();
        // Về trang chủ
        window.location.hash = '#home';
        location.reload(); // Tải lại để cập nhật
    } else {
        alert(result.message || 'Đặt hàng thất bại.');
    }
}


// --- 4. CÁC HÀM TIỆN ÍCH (COOKIE & GIỎ HÀNG) ---

/**
 * Hàm lấy Token từ Cookie
 */
function getToken() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('session_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}

/**
 * Hàm lưu giỏ hàng vào LocalStorage
 */
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

/**
 * Hàm tải giỏ hàng từ LocalStorage
 */
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    updateCartCount();
}

/**
 * Cập nhật số lượng trên icon giỏ hàng
 */
function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;
}

// Hàm global (để nút <button onclick="..."> gọi được)
window.addToCart = (id, name, price) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCartToLocalStorage();
    alert(`Đã thêm ${name} vào giỏ!`);
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    saveCartToLocalStorage();
    renderCartPage(); // "Vẽ" lại trang giỏ hàng
}


// --- 5. HÀM KHỞI CHẠY ---

/**
 * Hàm init() chạy khi trang tải xong
 */
function init() {
    // 1. Tải giỏ hàng từ bộ nhớ
    loadCartFromLocalStorage();
    
    // 2. "Vẽ" khu vực Đăng nhập/Logout (Header)
    renderUserNav();
    
    // 3. "Vẽ" các nhóm sản phẩm (Nav)
    renderCategoriesNav();
    
    // 4. "Vẽ" nội dung chính (Trang chủ)
    handleRouting();

    // 5. Lắng nghe thay đổi URL (dấu #)
    window.addEventListener('hashchange', handleRouting);

    // 6. Gắn sự kiện cho nút tìm kiếm
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Bắt đầu chạy ứng dụng!
init();