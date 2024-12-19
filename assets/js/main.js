let currentPage = 1;
const KEYS_PER_PAGE = 128;
let currentMode = 'bitcoin';
const MAX_PAGE = BigInt('904625697166532776746648320380374280100293470930272690489102837043110636675');

async function generateKeysForPage(page) {
    const keys = [];
    
    for (let i = 0; i < KEYS_PER_PAGE; i++) {
        const privateKey = await CryptoUtils.generatePrivateKey(page, i);
        
        if (currentMode === 'bitcoin') {
            const btcData = await CryptoUtils.generateBitcoinAddress(privateKey);
            if (btcData) {
                keys.push({
                    ...btcData,
                    privateKey,
                    index: i
                });
            }
        } else {
            const ethData = await CryptoUtils.generateEthereumAddress(privateKey);
            if (ethData) {
                keys.push({
                    ...ethData,
                    privateKey,
                    index: i
                });
            }
        }
    }

    return keys;
}

async function checkBalances(keys) {
    const addresses = keys.map(key => key.address);
    
    if (currentMode === 'bitcoin') {
        const balances = await BlockchainAPI.getBitcoinBalances(addresses);
        return keys.map(key => {
            const balanceData = balances.find(b => b.address === key.address);
            return {
                ...key,
                balance: balanceData ? balanceData.final_balance : 0,
                transactions: balanceData ? balanceData.n_tx : 0
            };
        });
    } else {
        const balances = await BlockchainAPI.getEthereumBalances(addresses);
        return keys.map(key => {
            const balanceData = balances.find(b => b.account.toLowerCase() === key.address.toLowerCase());
            return {
                ...key,
                balance: balanceData ? parseFloat(balanceData.balance) / 1e18 : 0
            };
        });
    }
}

function displayKeys(keys) {
    const container = document.getElementById('keyContainer');
    container.innerHTML = '';

    keys.forEach(key => {
        const keyElement = document.createElement('div');
        const hasBalance = key.balance > 0;
        const hasTransactions = (key.transactions || 0) > 0;
        
        keyElement.className = `key-entry ${hasBalance ? 'has-balance' : hasTransactions ? 'used' : 'unused'}`;
        
        keyElement.innerHTML = `
            <div class="key-details">
                <p><strong>Private Key:</strong> ${key.privateKey}</p>
                <p><strong>Public Key:</strong> ${key.publicKey}</p>
                <p><strong>Address:</strong> ${key.address}</p>
                <p><strong>Balance:</strong> ${key.balance} ${currentMode === 'bitcoin' ? 'BTC' : 'ETH'}</p>
                ${currentMode === 'bitcoin' ? `<p><strong>Transactions:</strong> ${key.transactions || 0}</p>` : ''}</div>
        `;
        
        container.appendChild(keyElement);
    });
}

async function updatePage() {
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${MAX_PAGE}`;
    const keys = await generateKeysForPage(currentPage);
    const keysWithBalances = await checkBalances(keys);
    displayKeys(keysWithBalances);
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('btcExplorer').classList.toggle('active', mode === 'bitcoin');
    document.getElementById('ethExplorer').classList.toggle('active', mode === 'ethereum');
    currentPage = 1;
    updatePage();
}

// Event Listeners
document.getElementById('btcExplorer').addEventListener('click', () => setMode('bitcoin'));
document.getElementById('ethExplorer').addEventListener('click', () => setMode('ethereum'));

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePage();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (BigInt(currentPage) < MAX_PAGE) {
        currentPage++;
        updatePage();
    }
});

document.getElementById('randomPage').addEventListener('click', () => {
    currentPage = Math.floor(Math.random() * Number(MAX_PAGE)) + 1;
    updatePage();
});

document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchValue = document.getElementById('searchInput').value.trim();
    if (CryptoUtils.validatePrivateKey(searchValue)) {
        // Search by private key
        const page = Math.floor(BigInt('0x' + searchValue) / BigInt(KEYS_PER_PAGE)) + 1;
        currentPage = page;
        updatePage();
    } else {
        // Search by address
        // Implement address search logic here
        console.log('Address search not implemented yet');
    }
});

// Initial load
updatePage();

