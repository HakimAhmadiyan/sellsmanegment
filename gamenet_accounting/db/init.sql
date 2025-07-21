CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('available', 'in_use') NOT NULL DEFAULT 'available'
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    cost DECIMAL(10, 2),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Insert some sample data
INSERT INTO devices (name) VALUES ('PS5 - 1'), ('PS5 - 2'), ('PC - 1'), ('PC - 2');
INSERT INTO items (name, price) VALUES ('نوشابه', 5000), ('چیپس', 10000);
