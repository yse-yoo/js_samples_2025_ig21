document.getElementById('search-btn').addEventListener('click', async () => {
    const name = document.getElementById('pokemon-name').value.toLowerCase().trim();
    const infoDiv = document.getElementById('pokemon-info');

    if (!name) {
        infoDiv.innerHTML = `<p class="text-red-500">名前またはIDを入力してください。</p>`;
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('ポケモンが見つかりませんでした');
        }

        const data = await response.json();

        infoDiv.innerHTML = `
      <h2 class="text-2xl font-semibold mb-4 capitalize">${data.name}</h2>
      <img src="${data.sprites.front_default}" alt="${data.name}" class="mx-auto mb-4" />
      <p class="text-gray-700 mb-1"><strong>高さ:</strong> ${data.height / 10} m</p>
      <p class="text-gray-700 mb-1"><strong>重さ:</strong> ${data.weight / 10} kg</p>
      <p class="text-gray-700"><strong>タイプ:</strong> ${data.types.map(t => t.type.name).join(', ')}</p>
    `;
    } catch (error) {
        infoDiv.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
});