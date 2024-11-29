const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const API_PARAMS = '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';

const cryptoTableBody = document.querySelector('#crypto-table tbody');
const comparisonContainer = document.getElementById('comparison-container');
const sortButton = document.getElementById('sort-by-market-cap');
let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

async function fetchCryptos() {
    try {
        const response = await fetch(API_URL + API_PARAMS);
        const data = await response.json();
        populateTable(data);
    } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
    }
}

function populateTable(cryptos) {
    cryptoTableBody.innerHTML = '';
    cryptos.forEach((crypto) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crypto.name}</td>
            <td>${crypto.symbol.toUpperCase()}</td>
            <td>$${crypto.current_price.toFixed(2)}</td>
            <td>${crypto.price_change_percentage_24h.toFixed(2)}%</td>
            <td>$${(crypto.market_cap / 1e9).toFixed(2)}B</td>
            <td>
                <button onclick="selectCrypto('${crypto.id}')">Select</button>
            </td>
        `;
        cryptoTableBody.appendChild(row);
    });
}

function selectCrypto(id) {
    if (selectedCryptos.length >= 5) {
        alert('You can only compare up to 5 cryptocurrencies.');
        return;
    }
    if (!selectedCryptos.includes(id)) {
        selectedCryptos.push(id);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonSection();
    }
}

function updateComparisonSection() {
    comparisonContainer.innerHTML = '';
    selectedCryptos.forEach((crypto) => {
        const div = document.createElement('div');
        div.textContent = crypto;
        comparisonContainer.appendChild(div);
    });
}

sortButton.addEventListener('click', () => {
    fetchCryptos();
});

window.onload = () => {
    fetchCryptos();
    updateComparisonSection();
};
