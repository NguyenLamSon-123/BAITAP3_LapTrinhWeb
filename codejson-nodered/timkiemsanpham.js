[
    {
        "id": "http_in_search",
        "type": "http in",
        "z": "tab_ecommerce_fixed",
        "name": "GET /api/products/search",
        "url": "/api/products/search",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 230,
        "y": 400,
        "wires": [
            [
                "func_sql_search"
            ]
        ]
    },
    {
        "id": "func_sql_search",
        "type": "function",
        "z": "tab_ecommerce_fixed",
        "name": "Set SQL Search",
        "func": "// Lấy từ khoá tìm kiếm từ URL (ví dụ: ?q=áo)\nconst searchTerm = msg.req.query.q;\n\n// Gán câu SQL, dùng ? và LIKE\n// Dấu % ở 2 bên nghĩa là \"tìm ở bất cứ đâu\" trong tên\nmsg.topic = \"SELECT * FROM products WHERE name LIKE ?\";\nmsg.payload = [ '%' + searchTerm + '%' ]; // Ghép thành '%áo%'\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 450,
        "y": 400,
        "wires": [
            [
                "mysql_exec_search"
            ]
        ]
    },
    {
        "id": "mysql_exec_search",
        "type": "mysql",
        "z": "tab_ecommerce_fixed",
        "mydb": "db_config_lamson",
        "name": "Lấy Search Results",
        "outField": "payload",
        "x": 670,
        "y": 400,
        "wires": [
            [
                "http_out_search"
            ]
        ]
    },
    {
        "id": "http_out_search",
        "type": "http response",
        "z": "tab_ecommerce_fixed",
        "name": "Trả về JSON",
        "statusCode": "200",
        "headers": {},
        "x": 890,
        "y": 400,
        "wires": []
    }
]