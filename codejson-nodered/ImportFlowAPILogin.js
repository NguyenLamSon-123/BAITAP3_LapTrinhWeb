[
    {
        "id": "http_in_login",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "POST /api/login",
        "url": "/api/login",
        "method": "post",
        "upload": false,
        "swaggerDoc": "",
        "x": 200,
        "y": 500,
        "wires": [
            [
                "func_hash_password"
            ]
        ]
    },
    {
        "id": "func_hash_password",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Hash Pass & Set SQL",
        "func": "// 1. Lấy thư viện mã hoá (có sẵn trong Node.js)\nconst crypto = require('crypto');\n\n// 2. Lấy username và password từ frontend gửi lên (JS sẽ gửi)\nconst pass = msg.payload.password;\nconst user = msg.payload.username;\n\n// 3. Băm cái password (admin123) thành SHA-256\nconst hash = crypto.createHash('sha256').update(pass).digest('hex');\n\n// 4. Chuẩn bị câu SQL để tìm user CÓ CẢ 2 ĐIỀU KIỆN\nmsg.topic = \"SELECT id, username, is_admin FROM users WHERE username = ? AND password_hash = ?\";\n\n// 5. Đây là 2 giá trị an toàn để thay vào dấu ?\nmsg.payload = [user, hash];\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 420,
        "y": 500,
        "wires": [
            [
                "mysql_check_user"
            ]
        ]
    },
    {
        "id": "mysql_check_user",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Kiểm tra User & Pass",
        "outField": "payload",
        "x": 640,
        "y": 500,
        "wires": [
            [
                "switch_check_result"
            ]
        ]
    },
    {
        "id": "switch_check_result",
        "type": "switch",
        "z": "tab_ecommerce_fixed",
        "name": "Tìm thấy user?",
        "property": "payload",
        "propertyType": "msg",
        "rules": [
            {
                "t": "nempty"
            },
            {
                "t": "else"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 2,
        "x": 840,
        "y": 500,
        "wires": [
            [
                "func_prep_token_payload"
            ],
            [
                "func_fail_response"
            ]
        ]
    },
    {
        "id": "func_fail_response",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả lỗi 401",
        "func": "msg.payload = { success: false, message: \"Sai tên đăng nhập hoặc mật khẩu\" };\nmsg.statusCode = 401;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1020,
        "y": 560,
        "wires": [
            [
                "http_out_fail"
            ]
        ]
    },
    {
        "id": "http_out_fail",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 401",
        "statusCode": "",
        "headers": {},
        "x": 1210,
        "y": 560,
        "wires": []
    },
    {
        "id": "func_prep_token_payload",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Lấy user info",
        "func": "// Database trả về 1 mảng, lấy phần tử đầu tiên\nconst user = msg.payload[0]; \n\n// Đây là thông tin ta sẽ lưu vào \"phiên đăng nhập\"\nmsg.payload = {\n    userId: user.id,\n    isAdmin: user.is_admin\n};\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1030,
        "y": 440,
        "wires": [
            [
                "jwt_sign_token"
            ]
        ]
    },
    {
        "id": "jwt_sign_token",
        "type": "jwt-sign",
        "z": "tab_ecommerce_fixed",
        "name": "Tạo Token (30 ngày)",
        "secret": "bi_mat_cua_ban_12345",
        "algorithm": "HS256",
        "expires": "30d",
        "x": 1240,
        "y": 440,
        "wires": [
            [
                "func_success_response"
            ]
        ]
    },
    {
        "id": "func_success_response",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả về Token",
        "func": "// Token là msg.payload được trả ra từ node JWT\nconst token = msg.payload;\n\nmsg.payload = { success: true, token: token };\nmsg.statusCode = 200;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1450,
        "y": 440,
        "wires": [
            [
                "http_out_success"
            ]
        ]
    },
    {
        "id": "http_out_success",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 200",
        "statusCode": "",
        "headers": {},
        "x": 1630,
        "y": 440,
        "wires": []
    }
]