const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = form.elements.username.value;
    const password = form.elements.password.value;

    // Відправка запиту для авторизації
    const response = await fetch("http://zxcmc.fun:3000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
		mode: 'cors',
		credentials: 'include'
    });

    const responseText = document.querySelector('.auth__response');

    if (response.ok) {
        // Якщо користувач авторизувався, перенаправляємо на панель управління замовленнями
        window.location.href = "/purchases";
    } else {
        responseText.textContent = 'Невірний пароль або логін!';
        const error = await response.text();
        console.error(error);
    }
});
