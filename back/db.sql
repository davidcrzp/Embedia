CREATE TABLE IF NOT EXISTS categoria (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS producto (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT             NOT NULL,
  precio       DOUBLE PRECISION NOT NULL,
  imagen       TEXT,
  stock        INTEGER          NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER          NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS usuario (
  id       SERIAL PRIMARY KEY,
  nombre   TEXT NOT NULL,
  email    TEXT NOT NULL UNIQUE,
  password TEXT,
  rol      TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('ADMIN','CLIENTE'))
);
CREATE TABLE IF NOT EXISTS pedido (
  id                SERIAL PRIMARY KEY,
  fecha             TEXT             NOT NULL,
  total             DOUBLE PRECISION NOT NULL,
  status            TEXT             NOT NULL,
  usuario_id        INTEGER          NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  metodo_pago       TEXT             NOT NULL DEFAULT 'tarjeta',
  mp_order_id       TEXT,
  mp_payment_id     TEXT,
  mp_status         TEXT,
  mp_payment_method TEXT,
  mp_last4          TEXT,
  mp_installments   INTEGER,
  mp_ticket_url     TEXT,
  mp_barcode        TEXT,
  mp_reference      TEXT,
  mp_expires_at     TEXT
);
CREATE TABLE IF NOT EXISTS pedido_detalle (
  id          SERIAL PRIMARY KEY,
  pedido_id   INTEGER          NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  producto_id INTEGER          NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
  cantidad    INTEGER          NOT NULL CHECK (cantidad > 0),
  precio      DOUBLE PRECISION NOT NULL
);
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS lat       DOUBLE PRECISION;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS lng       DOUBLE PRECISION;
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pedido_usuario     ON pedido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido     ON pedido_detalle(pedido_id);
CREATE INDEX IF NOT EXISTS idx_usuario_email      ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_pedido_mp_order    ON pedido(mp_order_id);
CREATE INDEX IF NOT EXISTS idx_pedido_status      ON pedido(status);

INSERT INTO categoria (nombre)
SELECT v.nombre FROM (VALUES
  ('SBC y Placas'), ('Microcontroladores'), ('Sensores'),
  ('Conectividad'), ('Alimentación'), ('Herramientas')
) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM categoria);

INSERT INTO producto (nombre, precio, imagen, stock, categoria_id)
SELECT * FROM (VALUES
  ('Raspberry Pi 5 · 8GB',            89.99, '/uploads/66894527-4c4f-45a0-aa6d-f95a6ea1edea.webp', 45, 1),
  ('Raspberry Pi 4 Model B · 4GB',    59.99, '/uploads/72d086d7-3697-4d27-a22c-bee48dbfe8fc.jpg', 60, 1),
  ('Raspberry Pi Zero 2 W',           19.99, '/uploads/1c908e43-c050-4b74-bd3f-35072684bec6.jpg', 80, 1),
  ('Orange Pi 5 Plus · 16GB',        129.00, '/uploads/beb8041e-4cd3-4c08-af65-a84a71a6c5e6.jpg', 25, 1),
  ('BeagleBone Black Rev C',          79.99, '/uploads/c568c8f3-78e9-410b-8236-e4f8d53ec935.jpg', 30, 1),
  ('NVIDIA Jetson Orin Nano',        249.00, '/uploads/c9d04f94-0b66-41e3-ade1-6be3ad77343d.jpg', 12, 1),
  ('Arduino Uno R4 WiFi',             27.50, '/uploads/ea836240-b5e4-4ba5-8538-3c1173a8d4a3.webp', 100, 1),
  ('Rock Pi 4 Model C+',              74.00, '/uploads/607e8f23-66d3-4873-bd3f-e3f4d9bf9933.jpg', 35, 1),
  ('ESP32-WROOM-32 DevKit',            9.99, '/uploads/9f7a15d4-a544-41a2-bc16-e1e0b94d7176.jpg', 200, 2),
  ('ESP32-S3 DevKitC-1',              15.99, '/uploads/5e53324e-e5f9-41d3-8789-2791f18cf8b2.jpg', 150, 2),
  ('STM32 Nucleo-F411RE',             24.99, '/uploads/ecf3a2d6-30f0-4010-8baf-4b08e8312527.jpg', 80, 2),
  ('Raspberry Pi Pico W',              6.50, '/uploads/b275dfe6-374d-4019-8716-1893a8edcda2.jpg', 250, 2),
  ('Arduino Nano Every',              13.90, '/uploads/8bb77c70-d593-42a8-88d6-41b517e8b695.jpg', 120, 2),
  ('Teensy 4.1',                      31.50, '/uploads/98e63868-8494-429e-98fb-6ce85610ddc0.jpg', 60, 2),
  ('ESP8266 NodeMCU V3',               4.99, '/uploads/9f49f775-4e77-4d5d-bab4-a35e7ffde36c.jpg', 300, 2),
  ('ATtiny85 Digispark',               5.50, '/uploads/8a9664f4-dc83-43e5-a071-a795f7e695c1.jpg', 180, 2),
  ('DHT22 Temp/Humedad',               8.90, '/uploads/98d5d5f8-643e-44f6-b146-80400dee2e6e.jpg', 150, 3),
  ('BME280 Presión/Humedad/Temp',     12.50, '/uploads/3afc394b-7d4b-4d26-9636-611904dc7ce5.webp', 120, 3),
  ('MPU6050 Giroscopio/Acelerómetro',  4.50, '/uploads/369eb618-fb29-4137-9fdb-08bc520b7835.jpg', 200, 3),
  ('HC-SR04 Ultrasónico',              2.90, '/uploads/d8034dd8-4c5d-40a6-a870-8413f6e27a96.jpg', 250, 3),
  ('PIR HC-SR501 Movimiento',          3.20, '/uploads/13398157-161b-4d19-91d2-85a9faab02c2.jpg', 180, 3),
  ('MQ-2 Gas/Humo',                    5.90, '/uploads/bcd89d14-557a-43f4-9a9b-af80ae9e456c.jpg', 140, 3),
  ('VL53L0X ToF Láser',               11.90, '/uploads/b2fa6ea3-3222-4df4-9905-f0676aa1eb22.jpg',  90, 3),
  ('ACS712 Sensor de Corriente 20A',   7.50, '/uploads/1aabaa1c-7e89-4266-8f11-f538a72b67ed.jpg', 110, 3),
  ('Módulo LoRa SX1276 868MHz',       14.90, '/uploads/68b58921-382d-47e2-8e44-c133c2737025.jpg', 90, 4),
  ('Módulo NRF24L01+ 2.4GHz',          3.90, '/uploads/477a1d1b-8d01-44e2-baf7-dd89526f68d8.jpg', 180, 4),
  ('SIM800L GSM/GPRS',                12.50, '/uploads/ecefa4a4-399e-4fbd-888e-27a24af3bf1f.jpg', 75, 4),
  ('HC-05 Bluetooth Clásico',          6.90, '/uploads/f9071a42-9879-480a-857b-38a5e53aef88.jpg', 160, 4),
  ('ESP32-CAM WiFi + Cámara',         11.90, '/uploads/a0f62350-82e5-4488-99c0-6f6c2d628a5c.jpg', 100, 4),
  ('Módulo RFID RC522 13.56MHz',       4.90, '/uploads/c2525bf8-01bc-4f9c-9970-777ad0c5c396.jpg', 140, 4),
  ('Módulo Ethernet W5500',           10.90, '/uploads/2eaabed3-2534-4c6d-b1d3-23c1faf2bbcd.jpg', 85, 4),
  ('GPS NEO-6M con antena',           13.90, '/uploads/37a65135-8272-4491-bc01-31ea72a787ad.jpg', 70, 4),
  ('Fuente switching 5V 3A',           9.90, '/uploads/f7a74a4e-fb86-4d8c-bc9b-09e70bd5564e.webp', 120, 5),
  ('Regulador LM2596 Step-Down',       3.50, '/uploads/1d8db92b-d4cb-421b-aa4a-37a4281ef760.jpg', 200, 5),
  ('Regulador AMS1117 3.3V',           1.20, '/uploads/8f28913b-d727-422f-88f1-e091522d9cbc.jpg', 400, 5),
  ('Batería LiPo 3.7V 2000mAh',        8.90, '/uploads/28561bb6-daa8-4636-b225-8d646025a3ca.jpg', 150, 5),
  ('Módulo TP4056 Cargador LiPo',      2.50, '/uploads/64e335b5-3e30-4320-ac7c-fb24caea772a.jpg', 250, 5),
  ('Step-Up MT3608 Boost 2A',          3.20, '/uploads/80ce2a75-4d42-4a40-b621-1fc06d3732d5.jpg', 180, 5),
  ('Panel Solar 6V 2W',                9.50, '/uploads/deb9d496-ff82-42dc-9d0e-aad370054615.jpg', 60, 5),
  ('Protoboard con fuente MB102',      5.90, '/uploads/4e6e0ec3-62f7-44f7-854c-3e87aeb184c6.jpg', 220, 5),
  ('Soldador TS100 Digital',          59.90, '/uploads/f464aa8a-59d7-4b73-9861-904f44b080a9.jpg', 40, 6),
  ('Multímetro UNI-T UT61E+',         89.90, '/uploads/52dbf78e-441c-412a-974a-f28f7776e9cc.jpg', 35, 6),
  ('Osciloscopio DSO138 DIY',         24.90, '/uploads/499a23e4-ccf2-4c1a-be4c-738d58289532.jpg', 50, 6),
  ('Analizador Lógico 8CH 24MHz',     12.90, '/uploads/be302ed8-af20-41d7-acfb-936ee64a0c5c.jpg', 70, 6),
  ('Estación de Aire Caliente 858D',  74.90, '/uploads/f8aff802-12d1-4285-8b27-dc1c96c252ae.jpg', 25, 6),
  ('Fuente de Banco 30V 5A',         109.00, '/uploads/6a7e617f-09cf-453f-8cef-3653859734d4.jpg', 20, 6),
  ('Kit Destornilladores Precisión',  19.90, '/uploads/0f72b164-7164-4415-b44e-90489ce84cf6.jpg', 90, 6),
  ('Pinza Crimpadora Dupont',         14.50, '/uploads/35e512f0-a37b-4f5f-824f-f4ca7105e680.jpg', 110, 6)
) AS v(nombre, precio, imagen, stock, categoria_id)
WHERE NOT EXISTS (SELECT 1 FROM producto);

INSERT INTO usuario (nombre, email, password, rol)
SELECT * FROM (VALUES
  ('Admin Embedia',   'admin@embedia.com',   '__ADMIN_HASH__',   'ADMIN'),
  ('Cliente Embedia', 'cliente@embedia.com', '__CLIENTE_HASH__', 'CLIENTE')
) AS v(nombre, email, password, rol)
WHERE NOT EXISTS (SELECT 1 FROM usuario);
