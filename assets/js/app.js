const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
const pokemonList = document.getElementById('pokemon-list');
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('pokemon-search');
const searchButton = document.getElementById('search-btn');

// Load last searched Pokémon from local storage
window.onload = () => {
    const lastSearched = localStorage.getItem('lastSearched');
    if (lastSearched) {
        searchInput.value = lastSearched;
        searchPokemon(lastSearched);
    } else {
        fetchPokemons();
    }
    const pokemonMusic = document.getElementById('pokemon-music');
    pokemonMusic.play().catch(error => {
        console.error('Error playing audio:', error);
    });
};

// Fetch Pokémon data
async function fetchPokemons(limit = 1008) {
    try {
        loadingSpinner.style.display = 'block';
        const response = await fetch(`${apiUrl}?limit=${limit}`);
        const data = await response.json();
        const detailedPokemons = await Promise.all(data.results.map(pokemon => fetchPokemonDetailsFromAPI(pokemon.url)));
        displayPokemons(detailedPokemons);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Fetch detailed Pokémon data
async function fetchPokemonDetailsFromAPI(url) {
    const response = await fetch(url);
    return response.json();
}

// Display Pokémon cards
function displayPokemons(pokemons) {
    pokemonList.innerHTML = '';
    pokemons.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('col-md-4', 'mb-3');
        pokemonCard.innerHTML = `
            <div class="card h-100" data-name="${pokemon.name}" data-id="${pokemon.id}">
                <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${pokemon.id}. ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h5>
                </div>
            </div>
        `;
        pokemonList.appendChild(pokemonCard);
        pokemonCard.addEventListener('click', () => {
            displayPokemonDetailsInModal(pokemon);
        });
    });
}

// Display Pokémon details in the modal
function displayPokemonDetailsInModal(pokemon) {
    const modalBody = document.getElementById('pokemon-details');
    modalBody.innerHTML = `
        <h5>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h5>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid mb-2">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Types:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
    modal.show();
}

// Filter Pokémon by type
async function filterByType(type) {
    try {
        loadingSpinner.style.display = 'block';
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const data = await response.json();
        const detailedPokemons = await Promise.all(data.pokemon.map(p => fetchPokemonDetailsFromAPI(p.pokemon.url)));
        displayPokemons(detailedPokemons);
    } catch (error) {
        console.error('Error fetching Pokémon by type:', error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Search Pokémon by name
async function searchPokemon(name) {
    const searchTerm = name.toLowerCase();
    if (searchTerm) {
        localStorage.setItem('lastSearched', searchTerm);
        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch(`${apiUrl}?limit=1008`);
            const data = await response.json();
            const filteredPokemons = await Promise.all(data.results.filter(pokemon => pokemon.name.includes(searchTerm)).map(p => fetchPokemonDetailsFromAPI(p.url)));
            displayPokemons(filteredPokemons);
        } catch (error) {
            console.error('Error searching Pokémon:', error);
        } finally {
            loadingSpinner.style.display = 'none';
        }
    } else {
        fetchPokemons();
    }
}

// Event listeners for dropdown buttons
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        const type = event.target.id;
        if (type === 'view-all') {
            fetchPokemons();
        } else {
            filterByType(type);
        }
    });
});

// Search Pokémon by name on button click
searchButton.addEventListener('click', () => {
    searchPokemon(searchInput.value);
});

// Initial fetch
fetchPokemons();
