[
    {
        "id": "http_in_create_order",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "POST /api/orders",
        "url": "/api/orders",
        "method": "post",
        "upload": false,
        "swaggerDoc": "",
        "x": 200,
        "y": 620,
        "wires": [
            [
                "jwt_verify_token"
            ]
        ]
    },
    {
        "id": "jwt_verify_token",
        "type": "jwt-verify",
        "z": "tab_ecommerce_fixed",
        "name": "Kiểm tra Token",
        "secret": "bi_mat_cua_ban_12345",
        "algorithm": "HS256",
        "output": "payload",
        "strict": true,
        "x": 400,
        "y": 620,
        "wires": [
            [
                "func_prep_order"
            ],
            [
                "func_order_fail"
            ]
        ]
    },
    {
        "id": "func_order_fail",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả lỗi 401",
        "func": "msg.payload = { success: false, message: \"Cần đăng nhập để đặt hàng\" };\nmsg.statusCode = 401;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 600,
        "y": 680,
        "wires": [
            [
                "http_out_order_fail"
            ]
        ]
    },
    {
        "id": "http_out_order_fail",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 401",
        "statusCode": "",
        "headers": {},
        "x": 790,
        "y": 680,
        "wires": []
    },
    {
        "id": "func_prep_order",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Chuẩn bị Transaction",
        "func": "// 1. Lấy thông tin từ frontend gửi lên\nconst shippingInfo = msg.payload.shippingInfo; // { name, phone, address }\nconst cart = msg.payload.cart; // [ {id, quantity, price} ]\n\n// 2. Lấy userId từ token đã được giải mã (node JWT làm)\nconst userId = msg.payload.userId;\n\n// 3. Tính tổng tiền (total_amount)\nlet totalAmount = 0;\ncart.forEach(item => {\n    totalAmount += item.price * item.quantity;\n});\n\n// 4. Bắt đầu 1 giao dịch SQL (Transaction)\nmsg.topic = \"START TRANSACTION\";\n\n// 5. Chuẩn bị query 1: Insert vào bảng `orders`\n// Chúng ta cần lấy ID của đơn hàng vừa tạo (LAST_INSERT_ID())\nconst sqlOrder = {\n    topic: \"INSERT INTO orders (user_id, shipping_info, total_amount, status) VALUES (?, ?, ?, 'pending');\",\n    payload: [userId, JSON.stringify(shippingInfo), totalAmount]\n};\nconst sqlGetOrderId = {\n    topic: \"SET @order_id = LAST_INSERT_ID();\"\n}\n\n// 6. Chuẩn bị query 2: Lặp qua giỏ hàng để insert vào `order_items`\nlet sqlItemsQueries = [];\ncart.forEach(item => {\n    sqlItemsQueries.push({\n        topic: \"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (@order_id, ?, ?, ?);\",\n        payload: [item.id, item.quantity, item.price]\n    });\n});\n\n// 7. Gửi TẤT CẢ các query này đến node mysql (cam)\n// Node mysql (cam) sẽ tự động chạy chúng theo thứ tự\nmsg.payload = [sqlOrder, sqlGetOrderId, ...sqlItemsQueries];\n\n// 8. Kết thúc giao dịch\nmsg.end_topic = \"COMMIT\"; // Nếu thành công thì COMMIT (lưu)\nmsg.error_topic = \"ROLLBACK\"; // Nếu lỗi thì ROLLBACK (hủy)\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 620,
        "y": 620,
        "wires": [
            [
                "mysql_exec_order"
            ]
        ]
    },
    {
        "id": "mysql_exec_order",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Chạy Transaction Đặt Hàng",
        "outField": "payload",
        "x": 870,
        "y": 620,
        "wires": [
            [
                "func_order_success"
            ]
        ]
    },
    {
        "id": "func_order_success",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả 200 OK",
        "func": "// Lấy ID đơn hàng đã tạo\nconst orderId = msg.payload[1].payload[0]['@order_id := LAST_INSERT_ID()'];\n\nmsg.payload = { success: true, orderId: orderId };\nmsg.statusCode = 200;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1090,
        "y": 620,
        "wires": [
            [
                "http_out_order_success"
            ]
        ]
    },
    {
        "id": "http_out_order_success",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 200",
        "statusCode": "",
        "headers": {},
        "x": 1270,
        "y": 620,
        "wires": []
    }
]