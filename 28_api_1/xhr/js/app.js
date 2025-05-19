const API_URL = './data/users.json';

// XHR作成
const xhr = new XMLHttpRequest();
// GETリクエスト設定
xhr.open('GET', API_URL, true);
// レスポンス処理
xhr.onload = function () {
    if (xhr.status === 200) {
        // XHRからJSON取得
        const json = xhr.responseText;
        // JSONパース
        const users = JSON.parse(json);
        // ユーザー情報をレンダリング
        renderUsers(users);
    } else {
        console.error('リクエストが失敗しました。');
    }
};

// エラー処理
xhr.onerror = function () {
    console.error('ネットワークエラーが発生しました。');
};

// TODO: XHRリクエスト（非同期）:send()

/**
 * ユーザー情報をHTMLにレンダリング
 * @param {Array} users
 */
function renderUsers(users) {
    const resultDiv = document.getElementById('result');
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('p-4', 'bg-white', 'space-y-2', 'rounded', 'shadow', 'border');

        userCard.innerHTML = `
            <h3 class="text-lg font-bold">${user.name}</h3>
            <div class="text-gray-600">
                <label class="bg-teal-500 text-sm text-white py-1 px-2 rounded">Age</label>
                <span>${user.age}</span>
            </div>
            <div class="text-gray-600">
                <label class="bg-teal-500 text-sm text-white py-1 px-2 rounded">City</label>
                <span>${user.city}</span>
            </div>
        `;
        resultDiv.appendChild(userCard);
    });
}