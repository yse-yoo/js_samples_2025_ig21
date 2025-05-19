const container = document.getElementById('weather-container');
const reportedAtContainer = document.getElementById('reported-at');
const topicContainer = document.getElementById('topics');
const errorContainer = document.getElementById('error');
var weatherData;

// Fetch API to get weather data from the endpoint
async function fetchWeather() {
    try {
        // API URI
        const uri = 'api/weather/report.php';
        // const uri = 'api/weather/list.json';

        // TODO:APIから非同期でデータ取得: fetch()
        const response = {};
        if (!response.ok) {
            displayError("天気情報の取得に失敗しました");
        }
        return await response.json();
    } catch (error) {
        displayError("天気情報の取得に失敗しました");
    }
}

// Function to display weather data
async function displayWeather(area = "") {
    try {
        // 現在のリストクリア
        container.innerHTML = '';
        errorContainer.innerHTML = '';

        // Fetch API データ
        weatherData = await fetchWeather();
        console.log(weatherData);

        // フィルタリング
        const cities = filterWeather(area);
        if (cities.length === 0) {
            displayError("天気情報がありません");
            return;
        }

        // TODO: 日時表示: weatherData.reportedAt
        reportedAtContainer.innerHTML;

        // TODO: トピック表示: weatherData.topics
        topicContainer.innerHTML;

        // 天気カード生成
        cities.forEach(({ city, temperature_max, temperature_min, condition, precipitationProbability }) => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-md rounded-lg p-3 text-center';

            // TODO: 仕様書からデータバインド
            card.innerHTML = `
                <h2 class="text-md font-bold mb-2"></h2>
                <p class="flex justify-center">
                    <img class="w-12 h-12" src="images/.png" alt="">
                </p>
                <p class="text-gray-500">
                    <span class="text-red-500 font-bold"></span>
                    /
                    <span class="text-blue-500 font-bold"></span>
                </p>
                <p class="text-gray-500">%</p>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        displayError(error);
    }
}

/**
 * 天気データフィルタイング
 * @param {*} data 
 * @param {*} selected 
 * @returns 
 */
function filterWeather(selected) {
    console.log(selected)
    if (!selected) return weatherData.cities;
    return weatherData.cities.filter(({ area }) => area == selected)
}

/**
 * フィルタボタン
 */
function setupFilterButtons() {
    // class=filter-btn をすべて選択
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((button) => {
        // クリックイベント追加
        button.addEventListener('click', (event) => {
            const area = event.currentTarget.dataset.area || '';
            // 気象情報表示
            displayWeather(area);
        });
    });
}

/**
 * エラーメッセージ
 * @param {*} error 
 */
function displayError(error) {
    errorContainer.innerHTML = error;
}

document.addEventListener('DOMContentLoaded', () => {
    // 全データ表示
    displayWeather();

    // フィルターボタンをセットアップ
    setupFilterButtons();
});