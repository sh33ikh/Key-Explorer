class UIUtils {
    static showLoading() {
        document.getElementById('loadingIndicator').style.display = 'block';
    }

    static hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    static showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    static formatBalance(balance, currency) {
        return `${balance.toFixed(8)} ${currency}`;
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            UIUtils.showNotification('Copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    }

    static showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

