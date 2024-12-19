const express = require("express");
const mariadb = require("mariadb");
const bodyParser = require("body-parser");
const JSONbig = require("json-bigint");
const csp = require("helmet-csp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: false });

const pool = mariadb.createPool({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TABLE,
  connectionLimit: 5,
});

const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Захист HTTP-заголовків
app.use(
  csp({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
      fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'"],
    },
  })
);

app.use(function (req, res, next) {
  const allowedOrigins = ['http://zxcmc.fun', 'http://185.201.252.165'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// const cors = require("cors");

// const corsOptions ={
   // origin:'*', 
   // credentials:true,            //access-control-allow-credentials:true
   // optionSuccessStatus:200,
// }

// app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/create-order", (req, res) => {
  res.send("Привіт!");
});

// Функції для форматування виводу списку товарів із замовлення
function getItems(items) {
  let itemsList = "";
  for (let i = 0; i < items.length; i++) {
    itemsList += `${items[i].name} (x${items[i].quantity})`;
    if (i !== items.length - 1) {
      itemsList += ", ";
    }
  }
  return itemsList;
}

bot.sendMessage("-1002401860086", "☘️ | **Бот** включений", { parse_mode: "Markdown" });

app.post("/create-order", (req, res) => {
  const { items, fullNameInput, phoneInput, emailInput, messageInput } = req.body;

  const cartTotal = items.reduce((total, item) => total + item.price, 0);

  pool
    .getConnection()
    .then((conn) => {
      const fullNameGet = fullNameInput.split(" ");

      const query1 = `INSERT INTO client (name, lastname, middlename, phone, email) VALUES (?, ?, ?, ?, ?)`;
      const values1 = [
        fullNameGet[0] != null ? fullNameGet[0] : "",
        fullNameGet[1] != null ? fullNameGet[1] : "",
        fullNameGet[2] != null ? fullNameGet[2] : "",
        phoneInput,
        emailInput,
      ];

      const query2 = `INSERT INTO purchase (items, price, comment, client_id, status) VALUES (?, ?, ?, ?, "new")`;
      const values2 = [
        JSON.stringify(items),
        cartTotal,
        messageInput,
        emailInput,
      ];

      // Виконуємо перший запит
      conn.query(query1, values1)
        .then((result1) => {
          // Отримуємо id новоствореного клієнта
          const clientId = result1.insertId;
          // Виконуємо другий запит з використанням id клієнта
          values2[3] = clientId;
          return conn.query(query2, values2);
        })
        .then((result2) => {
          conn.release();
          const serializedResult = JSONbig.stringify(result2);
          res.status(200).send(serializedResult);
          console.log(`[+] Створено замовлення на ${cartTotal} $`);

          const message = `*Створено нове замовлення!* ☘️\n\n⚊ *Клієнт*: \`${fullNameInput}\`\n⚊ *Телефон*: \`${phoneInput}\`\n⚊ *Пошта*: \`${emailInput}\`\n\n*Повідомлення*: \`${messageInput}\`\n\n*Замовлення*: \`${getItems(
            items
          )}\`\n\n*Ціна*: \`${cartTotal}\` USD`;

          const chatId = "-1002401860086";

          bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
        })
        .catch((error) => {
          conn.release();
          res.status(500).send(error);
          console.log(error);
        });
    })
    .catch((error) => {
      res.status(500).send(error);
      console.log(error);
    });
});

app.post("/create-msg", (req, res) => {
  const { fullNameInput, phoneInput, emailInput, messageInput } = req.body;
  const message = `*Повідомлення!* ☘️\n\n⚊ *Клієнт*: \`${fullNameInput}\`\n⚊ *Телефон*: \`${phoneInput}\`\n⚊ *Пошта*: \`${emailInput}\`\n\n*Повідомлення*: \`${messageInput}\``;

  const chatId = "-1002401860086";

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

  res.status(200).send("ok");
});

// Вивід кнопки для відмітки про виконання замовлення відносно статусу із переліку замовлень
function doneButton(status, id) {
  return status != `done`
    ? `<button class="set__done" onclick="doneOrder(${id})"><p>✔</p></button>`
    : ``;
}

// Роут для обробки запиту на /purchase
app.get("/purchase", async (req, res) => {
  // Отримуємо з'єднання з пулу з'єднань
  const conn = await pool.getConnection();
  const status = req.query.status;
  
  try {
    // Запит на отримання даних про замовлення з бази даних
    const rows = await conn.query(`
      SELECT
        purchase.id,
        purchase.items,
        purchase.price,
        purchase.comment,
        client.name,
        client.lastname,
        client.middlename,
        client.phone,
        client.email
      FROM purchase
      JOIN client ON purchase.client_id = client.id
      WHERE purchase.status = '${status}'
      ORDER BY purchase.id DESC;`);
    // Генерація HTML-коду замовлень
    let html = "";
    for (const row of rows) {
      html += `
        <div class="purchase__cart">
          <div class="cart__num">
            <h2 class="num__order">#${row.id}</h2>
            <p class="date__order">${new Date().toLocaleDateString()}</p>
          </div>
          <div class="cart__buy">
            <h2>Товар:</h2>
            <p class="list__order">${getItems(row.items)}</p>
          </div>
          <div class="cart__com">
            <h2>Коментар:</h2>
            <p class="comment__order">${row.comment}</p>
          </div>
          <div class="cart__inf">
            <h2 class="fullname__order">${row.lastname} ${row.name} ${
        row.middlename
      }</h2>
            <div class="cart__inf__client">
              <p class="phone__order">${row.phone}</p>
              <p class="email__order">${row.email}</p>
            </div>
            <h2 class="price__order">$${row.price}</h2>
          </div>
          <div class="cart__set">
            ${doneButton(status, row.id)}
            <button class="set__delete" onclick="deleteOrder(${
              row.id
            })" data-order-id="${row.id}"><p>✖</p></button>
          </div>
        </div>`;
    }

    // Відправка HTML-коду замовлень
    res.send(`
      <html>
        <head>
          <title>Заказы</title>
        </head>
        <body>
          <div class="purchase__container">
            ${html}
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("[!] Помилка на стороні сервера");
  } finally {
    // Закінчуємо і звільняємо з'єднання
    conn.release();
  }
});

app.post("/delete", (req, res) => {
  const id = req.body.id; // Отримуємо id замовлення з тіла запиту

  // Видаляємо замовлення з бази даних
  pool
    .getConnection()
    .then((conn) => {
      conn
        .query("DELETE FROM purchase WHERE id = ?", [id])
        .then((result) => {
          conn.release();
          res.json({ success: true }); // Відправляємо відповідь в форматі JSON
        })
        .catch((error) => {
          conn.release();
          console.error(error);
          res.status(500).json({
            success: false,
            error: "[!] Помилка при видаленні замовлення!",
          }); // Відправляємо код помилки в форматі JSON
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "[!] Помилка при видаленні замовлення!",
      }); // Відправляємо код помилки в форматі JSON
    });
});

app.post("/done", (req, res) => {
  const id = req.body.id; //Отримуємо id замовлення з тіла запиту

  // Відмічаєм замовлення, як виконане
  pool
    .getConnection()
    .then((conn) => {
      conn
        .query("UPDATE purchase SET status = 'done' WHERE id = ?", [id])
        .then((result) => {
          conn.release();
          res.json({ success: true }); // Відправляємо відповідь в форматі JSON
        })
        .catch((error) => {
          conn.release();
          console.error(error);
          res.status(500).json({
            success: false,
            error: "[!] Помилка при виконанні замовлення!",
          }); // Відправляємо код помилки в форматі JSON
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "[!] Помилка при виконанні замовлення!",
      }); // Відправляємо код помилки в форматі JSON
    });
});

async function connectToDatabase() {
  let connection;
  try {
    connection = await mariadb.createConnection({
      host: "localhost",
      user: "root",
      password: "false",
      database: "purchases",
      connectionLimit: 5,
    });
  } catch (err) {
    console.log("[!] Database connect error (test function connectToDatabases): " + err.message);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}

connectToDatabase();

// Визначення моделі користувача (для авторизації)
const User = {
  async findOne({ username }) {
    let conn;
    try {
      conn = await pool.getConnection();
      const rows = await conn.query("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      return rows[0];
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      if (conn) conn.end();
    }
  },
};

function createToken() {
  // Генерація JWT токена з використанням секретного ключа і часом дії токена
  const token = jwt.sign({}, process.env.SECRET_KEY, { expiresIn: "12h" });
  return token;
}

// Обробка запиту для авторизації
app.post("/auth", async (req, res) => {
  const { username, password } = req.body;
  // Перевірка наявності користувача у базі даних
  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).send("[!] Неправильне ім'я користувача або пароль");
    return;
  }
  // Перевірка правильності пароля
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).send("[!] Неправильне ім'я користувача або пароль");
    return;
  }
  // Встановлення захищеного файлу cookie з токеном
  const token = createToken();
  console.log(token);
  res.cookie('token', token, { httpOnly: false, secure: false, domain: 'zxcmc.fun' });
  res.status(200).send("[!] Done");
});

// Захист сторінки управління
app.get('/purchases', (req, res) => {
  // Перевірка наявності захищеного cookie-файлу з токеном
  const token = req.query.token;
  if (!token) {
    res.status(401).send('Необхідна авторизація! 1 ');
    return;
  }
  // Перевірка правильності токена
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.exp < Date.now() / 1000) {
      throw new Error();
    }
    // Якщо токен вірний, відкрити сторінку управління
    res.status(200).send();
  } catch {
    res.status(401).send('Необхідна авторизація! 2 ');
  }
});

// Функція для створення початкового користувача "root"
async function ensureRootUser() {
  let conn;
  try {
    conn = await pool.getConnection();

    const rows = await conn.query("SELECT * FROM users WHERE username = ?", ["root"]);

    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash("102938j", 10);

      await conn.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        ["root", hashedPassword, 1]
      );

      console.log("[+] Користувач 'root' успішно створений.");
    } else {
      console.log("[i] Користувач 'root' вже існує.");
    }
  } catch (err) {
    console.error("[!] Помилка під час перевірки або додавання користувача 'root':", err.message);
  } finally {
    if (conn) conn.release();
  }
}

// Викликаємо функцію для перевірки та створення користувача "root"
ensureRootUser();

app.listen(3000, () => {
  console.log("[!] Прослуховування порту 3000!");
});

