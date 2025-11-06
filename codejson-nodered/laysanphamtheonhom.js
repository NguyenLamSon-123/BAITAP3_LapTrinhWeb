[
    {
        "id": "http_in_by_category",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "GET /api/products/category/:id",
        "url": "/api/products/category/:id",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 260,
        "y": 300,
        "wires": [
            [
                "func_sql_by_category"
            ]
        ]
    },
    {
        "id": "func_sql_by_category",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Set SQL By Category",
        "func": "// Lấy ID từ URL (ví dụ: /api/products/category/1 -> id = 1)\nconst categoryId = msg.req.params.id;\n\n// Gán câu SQL, dùng ? để chống lỗi SQL Injection\n// Node 'mysql' (cam) sẽ tự động thay ? bằng giá trị\nmsg.topic = \"SELECT * FROM products WHERE category_id = ?\";\nmsg.payload = [categoryId]; // Đây là giá trị sẽ thay vào dấu ?\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 510,
        "y": 300,
        "wires": [
            [
                "mysql_exec_by_category"
            ]
        ]
    },
    {
        "id": "mysql_exec_by_category",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Lấy Products By Category",
        "outField": "payload",
        "x": 750,
        "y": 300,
        "wires": [
            [
                "http_out_by_category"
            ]
        ]
    },
    {
        "id": "http_out_by_category",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "Trả về JSON",
        "statusCode": "200",
        "headers": {},
        "x": 990,
        "y": 300,
        "wires": []
    }
]