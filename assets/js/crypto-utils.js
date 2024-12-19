class CryptoUtils {
    static async generatePrivateKey(page, index) {
        const seed = BigInt(page) * BigInt(128) + BigInt(index);
        const seedHex = seed.toString(16).padStart(64, '0');
        return seedHex;
    }

    static async generateBitcoinAddress(privateKey) {
        try {
            const keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
            const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
            const compressedPublicKey = keyPair.publicKey.toString('hex');
            const uncompressedPublicKey = secp256k1.getPublicKey(privateKey, false).slice(2);
            return {
                address,
                publicKey: uncompressedPublicKey,
                compressedPublicKey,
                wif: keyPair.toWIF()
            };
        } catch (error) {
            console.error('Error generating Bitcoin address:', error);
            return null;
        }
    }

    static async generateEthereumAddress(privateKey) {
        try {
            const privateKeyBuffer = Buffer.from(privateKey, 'hex');
            const publicKey = ethereumjs.privateToPublic(privateKeyBuffer);
            const address = ethereumjs.publicToAddress(publicKey);
            return {
                address: '0x' + address.toString('hex'),
                publicKey: publicKey.toString('hex')
            };
        } catch (error) {
            console.error('Error generating Ethereum address:', error);
            return null;
        }
    }

    static validatePrivateKey(privateKey) {
        try {
            const keyBigInt = BigInt('0x' + privateKey);
            const maxPrivateKey = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
            return keyBigInt > BigInt(0) && keyBigInt < maxPrivateKey;
        } catch {
            return false;
        }
    }

    static async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

