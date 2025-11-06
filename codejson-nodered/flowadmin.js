[
    {
        "id": "http_in_admin_get_orders",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "ADMIN: GET /api/admin/orders",
        "url": "/api/admin/orders",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 250,
        "y": 780,
        "wires": [
            [
                "jwt_verify_admin_get"
            ]
        ]
    },
    {
        "id": "jwt_verify_admin_get",
        "type": "jwt-verify",
        "z": "tab_ecommerce_fixed",
        "name": "Kiểm tra Token",
        "secret": "bi_mat_cua_ban_12345",
        "algorithm": "HS256",
        "output": "payload",
        "strict": true,
        "x": 490,
        "y": 780,
        "wires": [
            [
                "switch_is_admin_get"
            ],
            [
                "func_admin_fail"
            ]
        ]
    },
    {
        "id": "switch_is_admin_get",
        "type": "switch",
        "z": "tab_ecommerce_fixed",
        "name": "Là Admin?",
        "property": "payload.isAdmin",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "1",
                "vt": "num"
            },
            {
                "t": "else"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 2,
        "x": 680,
        "y": 780,
        "wires": [
            [
                "func_sql_admin_get"
            ],
            [
                "func_admin_fail"
            ]
        ]
    },
    {
        "id": "func_admin_fail",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả lỗi 403",
        "func": "msg.payload = { success: false, message: \"Không có quyền truy cập\" };\nmsg.statusCode = 403;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 680,
        "y": 840,
        "wires": [
            [
                "http_out_admin_fail"
            ]
        ]
    },
    {
        "id": "http_out_admin_fail",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 403",
        "statusCode": "",
        "headers": {},
        "x": 870,
        "y": 840,
        "wires": []
    },
    {
        "id": "func_sql_admin_get",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Set SQL Get All Orders",
        "func": "msg.topic = \"SELECT * FROM orders ORDER BY created_at DESC\";\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 880,
        "y": 780,
        "wires": [
            [
                "mysql_exec_admin_get"
            ]
        ]
    },
    {
        "id": "mysql_exec_admin_get",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Lấy Tất Cả Orders",
        "outField": "payload",
        "x": 1100,
        "y": 780,
        "wires": [
            [
                "http_out_admin_get"
            ]
        ]
    },
    {
        "id": "http_out_admin_get",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "Trả về JSON",
        "statusCode": "200",
        "headers": {},
        "x": 1310,
        "y": 780,
        "wires": []
    },
    {
        "id": "http_in_admin_update_order",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "ADMIN: PUT /api/admin/orders/:id",
        "url": "/api/admin/orders/:id",
        "method": "put",
        "upload": false,
        "swaggerDoc": "",
        "x": 260,
        "y": 940,
        "wires": [
            [
                "jwt_verify_admin_update"
            ]
        ]
    },
    {
        "id": "jwt_verify_admin_update",
        "type": "jwt-verify",
        "z": "tab_ecommerce_fixed",
        "name": "Kiểm tra Token",
        "secret": "bi_mat_cua_ban_12345",
        "algorithm": "HS256",
        "output": "payload",
        "strict": true,
        "x": 510,
        "y": 940,
        "wires": [
            [
                "switch_is_admin_update"
            ],
            [
                "func_admin_fail_update"
            ]
        ]
    },
    {
        "id": "switch_is_admin_update",
        "type": "switch",
        "z": "tab_ecommerce_fixed",
        "name": "Là Admin?",
        "property": "payload.isAdmin",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "1",
                "vt": "num"
            },
            {
                "t": "else"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 2,
        "x": 700,
        "y": 940,
        "wires": [
            [
                "func_sql_admin_update"
            ],
            [
                "func_admin_fail_update"
            ]
        ]
    },
    {
        "id": "func_admin_fail_update",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả lỗi 403",
        "func": "msg.payload = { success: false, message: \"Không có quyền truy cập\" };\nmsg.statusCode = 403;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 700,
        "y": 1000,
        "wires": [
            [
                "http_out_admin_fail_update"
            ]
        ]
    },
    {
        "id": "http_out_admin_fail_update",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 403",
        "statusCode": "",
        "headers": {},
        "x": 890,
        "y": 1000,
        "wires": []
    },
    {
        "id": "func_sql_admin_update",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Set SQL Update Order",
        "func": "// Lấy ID đơn hàng từ URL (ví dụ: .../orders/5)\nconst orderId = msg.req.params.id;\n\n// Lấy trạng thái mới và mã COD từ JS gửi lên\nconst newStatus = msg.payload.status;\nconst newCodCode = msg.payload.cod_code;\n\nmsg.topic = \"UPDATE orders SET status = ?, cod_code = ? WHERE id = ?\";\nmsg.payload = [newStatus, newCodCode, orderId];\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 900,
        "y": 940,
        "wires": [
            [
                "mysql_exec_admin_update"
            ]
        ]
    },
    {
        "id": "mysql_exec_admin_update",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Cập nhật Order",
        "outField": "payload",
        "x": 1120,
        "y": 940,
        "wires": [
            [
                "func_admin_success_update"
            ]
        ]
    },
    {
        "id": "func_admin_success_update",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Trả 200 OK",
        "func": "msg.payload = { success: true };\nmsg.statusCode = 200;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 1330,
        "y": 940,
        "wires": [
            [
                "http_out_admin_success_update"
            ]
        ]
    },
    {
        "id": "http_out_admin_success_update",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "HTTP 200",
        "statusCode": "",
        "headers": {},
        "x": 1510,
        "y": 940,
        "wires": []
    }
]