class BlockchainAPI {
    static async getEthereumBalances(addresses) {
        const addressList = addresses.join(',');
        const url = `https://api.etherscan.io/api?module=account&action=balancemulti&address=${addressList}&tag=latest&apikey=${API_KEYS.ETHERSCAN}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === '1') {
                return data.result;
            }
            return [];
        } catch (error) {
            console.error('Error fetching Ethereum balances:', error);
            return [];
        }
    }

    static async getBitcoinBalances(addresses) {
        // Try BlockCypher API first
        try {
            const balances = await Promise.all(addresses.map(async (address) => {
                const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=${API_KEYS.BLOCKCYPHER}`;
                const response = await fetch(url);
                const data = await response.json();
                return {
                    address: data.address,
                    final_balance: data.final_balance / 100000000, // Convert satoshis to BTC
                    n_tx: data.n_tx
                };
            }));
            return balances;
        } catch (error) {
            console.error('Error fetching Bitcoin balances from BlockCypher:', error);
        }

        // Fallback to Blockchain.info API
        try {
            const url = `https://blockchain.info/multiaddr?active=${addresses.join('|')}&api_key=${API_KEYS.BLOCKCHAIN_INFO}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return data.addresses.map(addr => ({
                address: addr.address,
                final_balance: addr.final_balance / 100000000, // Convert satoshis to BTC
                n_tx: addr.n_tx
            }));
        } catch (error) {
            console.error('Error fetching Bitcoin balances from Blockchain.info:', error);
            return [];
        }
    }
}

