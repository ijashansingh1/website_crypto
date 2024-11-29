
// Mock data to simulate CoinGecko API response
const mockData = [
    {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 48235.67,
        price_change_percentage_24h: 2.45,
        market_cap: 938475634523
    },
    {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 2856.32,
        price_change_percentage_24h: -1.23,
        market_cap: 345678912345
    },
    {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        current_price: 1.23,
        price_change_percentage_24h: 5.67,
        market_cap: 123456789012
    },
    {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        current_price: 98.76,
        price_change_percentage_24h: 3.21,
        market_cap: 234567890123
    },
    {
        id: 'polkadot',
        symbol: 'dot',
        name: 'Polkadot',
        current_price: 23.45,
        price_change_percentage_24h: -2.34,
        market_cap: 345678901234
    }
];

class CryptoTracker {
    constructor() {
        this.cryptocurrencies = [];
        this.comparisonList = new Set();
        this.loadPreferences();
        this.initializeEventListeners();
        this.fetchData();
    }

    loadPreferences() {
        const savedComparison = localStorage.getItem('comparisonList');
        if (savedComparison) {
            this.comparisonList = new Set(JSON.parse(savedComparison));
        }

        const sortPreference = localStorage.getItem('sortPreference') || 'marketCap';
        document.getElementById('sortPreference').value = sortPreference;
    }

    savePreferences() {
        localStorage.setItem('comparisonList', JSON.stringify([...this.comparisonList]));
        localStorage.setItem('sortPreference', document.getElementById('sortPreference').value);
    }

    async fetchData() {
        // In a real implementation, this would fetch from CoinGecko API
        const myHeaders = new Headers();
        myHeaders.append("accept", "application/json");
        myHeaders.append("x-cg-demo-api-key", "Your API Key");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        // this.cryptocurrencies = mockApiResponse;

        // const result = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&ids=bitcoin%2Cethereum%2Csolana%2Cpolkadot%2Cdoge%2Ccardano", requestOptions)
        // this.cryptocurrencies = await result.json()

        const localCache = localStorage.getItem("api-cache")
        const cacheObj = JSON.parse(localCache)

        if (localCache === null || (localCache !== null && Date.now() - cacheObj.ts > 30000)) {
         //   const result = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&ids=bitcoin%2Cethereum%2Csolana%2Cpolkadot%2Cdoge%2Ccardano", requestOptions)
       // this.cryptocurrencies = await result.json()
        this.cryptocurrencies = mockData

            localStorage.setItem("api-cache", JSON.stringify({ "resp": mockData, "ts": Date.now() }))
            console.log(`Cache Updated at ${Date.now()}`)
        } else {
            this.cryptocurrencies = cacheObj.resp
        }

       // this.cryptocurrencies = mockData;
        this.sortCryptocurrencies();
        this.renderCryptoList();
        this.renderComparisonSection();
    }

    sortCryptocurrencies() {
        const sortBy = document.getElementById('sortPreference').value;
        this.cryptocurrencies.sort((a, b) => {
            switch(sortBy) {
                case 'price':
                    return b.current_price - a.current_price;
                case 'change':
                    return b.price_change_percentage_24h - a.price_change_percentage_24h;
                default:
                    return b.market_cap - a.market_cap;
            }
        });
    }

    renderCryptoList() {
        const container = document.getElementById('cryptoList');
        container.innerHTML = '';

        this.cryptocurrencies.forEach(crypto => {
            const card = document.createElement('div');
            card.className = 'crypto-card';
            card.innerHTML = `
                <div class="crypto-info">
                    <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                    <div class="crypto-price">$${crypto.current_price.toLocaleString()}</div>
                    <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                </div>
                <button onclick="tracker.toggleComparison('${crypto.id}')" 
                        ${this.comparisonList.has(crypto.id) ? 'class="remove"' : ''}>
                    ${this.comparisonList.has(crypto.id) ? 'Remove' : 'Compare'}
                </button>
            `;
            container.appendChild(card);
        });
    }

    renderComparisonSection() {
        const container = document.getElementById('comparisonGrid');
        container.innerHTML = '';

        this.cryptocurrencies
            .filter(crypto => this.comparisonList.has(crypto.id))
            .forEach(crypto => {
                const card = document.createElement('div');
                card.className = 'comparison-card';
                card.innerHTML = `
                    <h3>${crypto.name}</h3>
                    <div class="crypto-price">$${crypto.current_price.toLocaleString()}</div>
                    <div class="price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    <div>Market Cap: $${(crypto.market_cap / 1e9).toFixed(2)}B</div>
                    <button class="remove" onclick="tracker.toggleComparison('${crypto.id}')">Remove</button>
                `;
                container.appendChild(card);
            });
    }

    toggleComparison(cryptoId) {
        if (this.comparisonList.has(cryptoId)) {
            this.comparisonList.delete(cryptoId);
        } else if (this.comparisonList.size < 5) {
            this.comparisonList.add(cryptoId);
        } else {
            alert('Maximum 5 cryptocurrencies can be compared at once');
            return;
        }
        
        this.savePreferences();
        this.renderCryptoList();
        this.renderComparisonSection();
    }

    initializeEventListeners() {
        document.getElementById('sortPreference').addEventListener('change', () => {
            this.savePreferences();
            this.sortCryptocurrencies();
            this.renderCryptoList();
        });

        document.getElementById('updateInterval').addEventListener('change', (e) => {
            clearInterval(this.updateInterval);
            this.updateInterval = setInterval(() => this.fetchData(), e.target.value * 1000);
        });

        this.updateInterval = setInterval(() => this.fetchData(), 60000);
    }
}

const tracker = new CryptoTracker();
