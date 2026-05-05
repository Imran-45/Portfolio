async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) return;
    const url = `https://wttr.in/${city}?format=j1`;
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = 'Loading...';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('City not found');
        const data = await res.json();
        const current = data.current_condition[0];
        weatherInfo.innerHTML = `
            <div class="temp">${current.temp_C}°C</div>
            <div class="desc">${current.weatherDesc[0].value}</div>
            <div>Humidity: ${current.humidity}%</div>
            <div>Wind: ${current.windspeedKmph} km/h</div>
        `;
    } catch (err) {
        weatherInfo.innerHTML = `<div style="color:red;">${err.message}</div>`;
    }
}
