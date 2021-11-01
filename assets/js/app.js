const PASSWORD = localStorage.getItem('code') === null ? "0000" : JSON.parse(localStorage.getItem('code'));

if (localStorage.getItem('isAuth') === null) {
    localStorage.setItem('isAuth', JSON.stringify(false));
}

let IS_AUTH = JSON.parse(localStorage.getItem('isAuth'));

const auth = document.getElementById('auth');
const app = document.getElementById('wallet');

if (IS_AUTH) {

    auth.classList.add('hide');
    app.classList.remove('hide')

    const wallet = getWallet();

    function getWallet() {
        if (localStorage.getItem('wallet') === null) {
            localStorage.setItem('wallet', JSON.stringify({
                history: [],
                categories: [
                    {value: "none", display: "Выберите категорию"}
                ]
            }))

            return JSON.parse(localStorage.getItem('wallet'));
        } else {
            return JSON.parse(localStorage.getItem('wallet'));
        }
    }

    function getBalance() {
        return getIncomeBalance() - getExpensesBalance();
    }

    function getIncome() {
        if (wallet.history.length === 0) {
            return [];
        }

        console.log(wallet);

        return wallet.history.filter((_) => _.type.value === 'income');
    }

    function getExpenses() {
        if (wallet.history.length === 0) {
            return [];
        }

        return wallet.history.filter((_) => _.type.value === 'expenses');
    }

    function getExpensesBalance() {
        return getExpenses().reduce((prev, current) => prev += current.amount, 0);
    }

    function getIncomeBalance() {
        return getIncome().reduce((prev, current) => prev += current.amount, 0);
    }

    function income() {
        const el = document.getElementById('income');

        const input = el.querySelector('input');
        const btn = el.querySelector('button');
        const selector = el.querySelector('select');

        btn.addEventListener('click', () => {
            setIncome(input.value.trim(), selector.options[selector.selectedIndex].value);
            input.value = '';
            selector.selectedIndex = 0;
        })
    }

    function setIncome(amount = 0, category) {
        if (isNaN(Number(amount))) {
            alert("Ошибка! Вводите только числа!");
            return;
        }

        const data = {
            type: {
                value: 'income',
                display: "Доход"
            },
            amount: Number(amount),
            date: Date.now(),
            category: {
                value: category.trim().toLowerCase(),
                display: category.trim()
            }
        }

        wallet.history.push(data);

        localStorage.setItem('wallet', JSON.stringify(wallet));

        render();
    }

    function expenses() {
        const el = document.getElementById('expenses');

        const input = el.querySelector('input');
        const btn = el.querySelector('button');
        const selector = el.querySelector('select');

        btn.addEventListener('click', () => {
            setExpenses(input.value.trim(), selector.options[selector.selectedIndex].value);
            input.value = '';
            selector.selectedIndex = 0;
        })
    }

    function setExpenses(amount = 0, category) {

        if (isNaN(Number(amount))) {
            alert("Ошибка! Вводите только числа!");
            return;
        }

        const data = {
            type: {
                value: 'expenses',
                display: "Расход"
            },
            amount: Number(amount),
            date: Date.now(),
            category: {
                value: category.trim().toLowerCase(),
                display: category.trim()
            }
        }

        wallet.history.push(data);

        localStorage.setItem('wallet', JSON.stringify(wallet));

        render();
    }

    function sortByDay() {
        const day = new Date().setDate(new Date().getDate() - 1);
        return wallet.history.filter((_) => _.date >= day);
    }

    function sortByWeek() {
        const week = new Date().setDate(new Date().getDate() - 7);
        return wallet.history.filter((_) => _.date >= week);
    }

    function sortByMonth() {
        const month = new Date().setMonth(new Date().getMonth() - 1);
        return wallet.history.filter((_) => _.date >= month);
    }

    function sortByCategory(category) {
        return wallet.history.filter((_) => _.category.value === category.trim().toLowerCase());
    }

    function getRandomNumber(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }

    function recommendations() {
        document.querySelector("#recommendation").textContent = `${wallet.categories[getRandomNumber(0, wallet.categories.length)].display.toLowerCase()}`;
    }

    function filter() {
        const el = document.getElementById('filter');

        const filter = el.querySelector('#filterSelector');
        const category = el.querySelector('#categoryFilter');

        filter.addEventListener('change', (e) => {
            switch (e.target.options[e.target.selectedIndex].value) {
                case "all":
                    renderStat();
                    notification(`История транзакций за всё время`);

                    break;

                case 'day':
                    renderStat(sortByDay());
                    notification(`История транзакций за день`);

                    break;
                case 'month':
                    renderStat(sortByMonth());
                    notification(`История транзакций за месяц`);

                    break;
                case 'week':
                    renderStat(sortByWeek());
                    notification(`История транзакций за неделю`);
                    break;
            }
        });

        category.addEventListener('change', (e) => {
            renderStat(sortByCategory(e.target.options[e.target.selectedIndex].value))
        });


    }

    function render() {
        renderSummary();
        renderCategory();
        renderStat();
    }

    function logout() {
        localStorage.setItem('isAuth', JSON.stringify(false));
        location.reload();
    }

    function changePassword(password) {
        localStorage.setItem('code', JSON.stringify(password));
        notification('Пароль изменен!');
    }

    function settings() {
        document.getElementById('logoutButton').addEventListener('click', logout);
        document.getElementById('changeBtn').addEventListener('click', () => {
            if (document.getElementById('passwordInout').value.trim().length > 0) {
                changePassword(document.getElementById('passwordInout').value.trim());
                document.getElementById('passwordInout').value = '';
            } else {
                notification("Пароль не может быть пустым!");
            }
        })

        document.getElementById('resetBtn').addEventListener('click', () => {
            localStorage.setItem('code', JSON.stringify('0000'));
            notification('Пароль успешно сброшен!')
        })
    }

    function notification(data) {
        const el = document.querySelector('.notifications');

        el.insertAdjacentHTML(`beforeend`, `
            <div class="notification">
                <h4>Уведомление</h4>
                <p>${data}</p>
        </div>
        `);

        el.querySelectorAll(".notification").forEach((e) => {
            setTimeout(() => {
                e.remove();
            }, 3000)
        })
    }

    function renderStat(data = wallet.history) {
        const el = document.getElementById('list');

        el.innerHTML = '';

        data.map((_) => {
            el.insertAdjacentHTML(`beforeend`, `
                <li class="list-item ${_.type.value}">[${_.type.display}] ${_.category.display === "none" ? 'Без категории' : _.category.display} - ${_.amount} (${new Date(_.date).toLocaleString()})</li>
            `);
        })
    }

    function renderCategory(data = wallet.categories) {
        const elems = document.querySelectorAll('.category-selector');

        for (const el of elems) {
            el.innerHTML = '';

            data.map((_) => {
                el.insertAdjacentHTML('beforeend', `
                    <option value="${_.value}">${_.display}</option>
                `);
            })
        }
    }

    function renderSummary() {
        document.getElementById('balance_span').textContent = getBalance();
        document.getElementById('income_span').textContent = getIncomeBalance();
        document.getElementById('expenses_span').textContent = getExpensesBalance();
    }

    function category() {
        const el = document.getElementById('category');

        const btn = el.querySelector('button');
        const input = el.querySelector('input');

        btn.addEventListener('click', () => {
            setCategory(input.value.trim());
            notification(`Добавлена новая категория: ${input.value.trim()}`)
            input.value = '';
        });
    }

    // Добавляем категорию и выводим её
    function setCategory(data) {

        wallet.categories.push({
            display: data.trim(),
            value: data.trim().toLowerCase()
        })

        localStorage.setItem('wallet', JSON.stringify(wallet));
        renderCategory();
    }

    income();
    expenses();
    category();
    render()
    settings();
    filter();
    recommendations();

} else {

    // Скрипт для авторизации
    const section = document.getElementById('auth');

    const input = section.querySelector('input');

    input.addEventListener('input', (e) => {
        if (e.target.value.trim() === PASSWORD) {
            localStorage.setItem('isAuth', JSON.stringify(true));
            location.reload();
        }
    })
}
