// --- 1. ĐỊNH NGHĨA BIẾN VÀ LẤY ELEMENTS ---
const ordersListContainer = document.getElementById('orders-list');
const logoutButton = document.getElementById('logout-button');

// Địa chỉ API của Node-RED
const API_URL = 'http://127.0.0.1:1880/api';

// --- 2. CÁC HÀM TIỆN ÍCH (LẤY TOKEN) ---

/**
 * Hàm lấy Token từ Cookie (Copy từ app.js)
 */
function getToken() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('session_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}

/**
 * Xử lý sự kiện bấm Đăng xuất (Copy từ app.js)
 */
function handleLogout(event) {
    if (event) event.preventDefault();
    // Xoá cookie bằng cách cho nó hết hạn
    document.cookie = 'session_token=; max-age=-1; path=/';
    alert('Đã đăng xuất!');
    // Về trang đăng nhập
    window.location.href = 'index.html#login';
}

// --- 3. CÁC HÀM "VẼ" GIAO DIỆN ADMIN ---

/**
 * Hàm "vẽ" danh sách đơn hàng ra màn hình
 */
function renderOrdersList(orders) {
    if (orders.length === 0) {
        ordersListContainer.innerHTML = '<h3>Chưa có đơn hàng nào.</h3>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID Đơn</th>
                    <th>Ngày Đặt</th>
                    <th>Thông tin Giao Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Mã COD</th>
                    <th>Cập Nhật</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        // Parse JSON
        const shipping = JSON.parse(order.shipping_info);
        
        tableHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${new Date(order.created_at).toLocaleString('vi-VN')}</td>
                <td>
                    <b>Tên:</b> ${shipping.name}<br>
                    <b>SĐT:</b> ${shipping.phone}<br>
                    <b>Địa chỉ:</b> ${shipping.address}
                </td>
                <td>${order.total_amount.toLocaleString('vi-VN')} VNĐ</td>
                
                <td><input type="text" id="status-${order.id}" value="${order.status}"></td>
                <td><input type="text" id="cod-${order.id}" value="${order.cod_code || ''}"></td>
                <td>
                    <button onclick="handleUpdateOrder(${order.id})">Lưu</button>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    ordersListContainer.innerHTML = tableHTML;
}

// --- 4. CÁC HÀM XỬ LÝ LOGIC (GỌI API) ---

/**
 * Hàm gọi API để lấy tất cả đơn hàng
 */
async function fetchOrders() {
    const token = getToken();
    
    // 1. Kiểm tra xem có token (đã login) chưa
    if (!token) {
        alert('Bạn cần đăng nhập với tư cách Admin để xem trang này.');
        // Chuyển về trang đăng nhập của web chính
        window.location.href = 'index.html#login';
        return;
    }

    // 2. Gọi API Admin (GET /api/admin/orders)
    const response = await fetch(`${API_URL}/admin/orders`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Gửi token để xác thực
        }
    });

    // 3. Xử lý kết quả
    if (response.status === 200) {
        // Thành công, vẽ ra
        const orders = await response.json();
        renderOrdersList(orders);
    } else if (response.status === 403) {
        // Đã đăng nhập, nhưng KHÔNG PHẢI Admin
        alert('Bạn không có quyền Admin!');
        window.location.href = 'index.html'; // Về trang chủ
    } else {
        // Lỗi 401 (Token hết hạn...)
        alert('Phiên đăng nhập không hợp lệ.');
        handleLogout();
    }
}

/**
 * Hàm gọi API để cập nhật đơn hàng
 */
// Phải để ở global scope để <button onclick="..."> gọi được
window.handleUpdateOrder = async (orderId) => {
    const token = getToken();

    // 1. Lấy dữ liệu từ ô input
    const newStatus = document.getElementById(`status-${orderId}`).value;
    const newCodCode = document.getElementById(`cod-${orderId}`).value;

    // 2. Gọi API Admin (PUT /api/admin/orders/:id)
    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Gửi token
        },
        body: JSON.stringify({
            status: newStatus,
            cod_code: newCodCode
        })
    });

    const result = await response.json();

    if (result.success) {
        alert('Cập nhật đơn hàng thành công!');
        // Tải lại danh sách đơn hàng
        fetchOrders();
    } else {
        alert(result.message || 'Cập nhật thất bại.');
    }
}


// --- 5. HÀM KHỞI CHẠY ---
function init() {
    // 1. Gắn sự kiện cho nút Logout
    logoutButton.addEventListener('click', handleLogout);

    // 2. Tải danh sách đơn hàng ngay lập tức
    fetchOrders();
}

// Bắt đầu chạy!
init();