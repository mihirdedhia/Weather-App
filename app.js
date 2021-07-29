console.log("Welcome to Weather App...");

// Getting references of elements

const bg_image1 = document.querySelector(".bg-image1");
const toggle_button = document.querySelector("#toggle-button");
const weather_main = document.querySelector(".weather-main");
const bg2 = document.querySelector(".bg2");


const notification_container = document.querySelector(".notification-container");
const toggle_button_checkbox = document.querySelector("#toggle-button .checkbox");
const search_box = document.querySelector("#search-box");
const search_btn = document.querySelector("#search-btn");

// Weather Main references
const weather_info__city_country = document.querySelector(".weather-main .weather-info__city-country");
const weather_info__date = document.querySelector(".weather-main .weather-info__date");
const weather_info__time = document.querySelector(".weather-main .weather-info__time");
const weather_info__temperature = document.querySelector(".weather-main .weather-info__temperature");
const weather_info__description = document.querySelector(".weather-main .weather-info__description");
const weather_info__icon = document.querySelector(".weather-main .weather-info__icon");
const feels_like = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const chance_of_rain = document.querySelector("#chance-of-rain");
const wind_speed = document.querySelector("#wind-speed");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");
const pressure = document.querySelector("#pressure");
const uv_index = document.querySelector("#uv_index");


// Weather Forecast references
const tab_btn = document.querySelectorAll(".tabs .tab-btn");
const tab_content = document.querySelectorAll(".tab-content-container .tab-content");

const forecast_hourly_container = document.querySelector(".forecast-hourly-container");
const forecast_weekly_container = document.querySelector(".forecast-weekly-container");


const KELVIN = 273;
// Creating temperature object and having unit property in it which we will change to °F when toggle button is clicked
const temperature = {
    unit: "celsius"
};

// Getting references of temperature values and units
let temp_value = document.querySelectorAll(".temp_value");
let temp_unit = document.querySelectorAll(".temp_unit");


let locationtxt;
let latitude;
let longitude;

// Creating Weather API object
const api = {
    key: "28537765880d48306ac36e1de2225622",
    base_url: "https://api.openweathermap.org/data/2.5/"
}

// GET LOCATION - START
// Defining getLocation function and it will check if browser supports geolocation service then fetch coordinates by calling showPosition function else show error to user
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        locationtxt = "Geolocation is not supported by this browser.";
        // console.log(locationtxt);
        showNotificationContainer();
        notification_container.innerHTML = locationtxt;
    }
}

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    locationtxt = "Latitude: " + latitude + " Longitude: " + longitude;
    console.log(locationtxt);
    FetchWeather(latitude, longitude);
    getLocationNameFromCoords(latitude, longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationtxt = "User denied the request for Geolocation." + " Please enable Location services"
            break;
        case error.POSITION_UNAVAILABLE:
            locationtxt = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            locationtxt = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            locationtxt = "An unknown error occurred."
            break;
    }
    // console.log(locationtxt);
    showNotificationContainer();
    notification_container.innerHTML = locationtxt;
}
// GET LOCATION - END


// Calling getLocation function
getLocation();

// FETCH WEATHER - START
// FetchWeather function will send request to weather api and fetch weather by taking latitude and longitude
function FetchWeather(latitude, longitude) {
    // fetch("one_call_response.json")
    fetch(`${api.base_url}onecall?lat=${latitude}&lon=${longitude}&appid=${api.key}`)
        .then(weather => {
            let data = weather.json();
            return data;
        }).then(data => {
            // if we get data then call DisplayWeather() which will show weather to user
            DisplayWeather(data);
        }).catch((error) => {
            locationtxt = "Please search for a valid city or country name 😩";
            showNotificationContainer();
            notification_container.innerHTML = locationtxt;
            console.log(error);
        });
}
// FETCH WEATHER - END


// DISPLAY WEATHER - START
function DisplayWeather(data) {
    // console.log(data);

    // weather_info__city_country.innerHTML = data.timezone;

    // getting current date and time of weather location
    let date = data.current.dt;
    // displaying date and time to user and formatDate() will format date and time
    weather_info__date.innerHTML = formatDate(date);
    weather_info__time.innerHTML = formatTime(date);

    // displaying temperature to user and converting temperature value to Celsius by subtracting KELVIN value
    weather_info__temperature.innerHTML = Math.round(data.current.temp - KELVIN);

    // displaying weather description to user
    weather_info__description.innerHTML = data.current.weather[0].description;

    // getting id and icon reference and calling setWeatherIcon() which will insert icon image to website
    let weather_description_icon_id = data.current.weather[0].id;
    let weather_description_icon = data.current.weather[0].icon;
    // weather_info__icon.src = `http://openweathermap.org/img/wn/${weather_description_icon}@4x.png`;
    // weather_info__icon.src = `images/svg_weather_icons/${weather_description_icon}.svg`;
    setWeatherIcon(weather_description_icon, weather_description_icon_id, weather_info__icon);

    // Similarly setting weather details data and displaying to user
    feels_like.innerHTML = Math.round(data.current.feels_like - KELVIN);

    let humidity_value = Math.round(data.current.humidity);
    humidity.innerHTML = `${humidity_value} <span>%</span>`;

    let chance_of_rain_value = Math.round(data.hourly[0].pop * 100);
    chance_of_rain.innerHTML = `${chance_of_rain_value} <span>%</span>`;

    wind_speed.innerHTML = `${data.current.wind_speed} <span>m/s</span>`;

    sunrise.innerHTML = formatTime(data.current.sunrise);

    sunset.innerHTML = formatTime(data.current.sunset);

    pressure.innerHTML = `${data.current.pressure} <span>hPa</span>`;

    uv_index.innerHTML = data.current.uvi;

    // after setting weather main data we are calling fuctions for hourly and weekly forecast
    DisplayHourlyForecastWeather(data);
    DisplayWeeklyForecastWeather(data);

}
// DISPLAY WEATHER - END


// HOURLY WEATHER FORECAST SECTION - START
function DisplayHourlyForecastWeather(data) {

    // getting now time
    let weather_now_time = formatHourTime(data.current.dt);
    let nowIndex;   // nowindex will set index of now hour time
    
    let htmlStr = "";
    // hourly forecast shows for 2 days that's 48 hours so for one day 24 hours
    for (let index = 0; index < 25; index++) {
        let hourData = data.hourly[index];

        let hourTime = formatHourTime(hourData.dt);
        let hourTemperature = Math.round(hourData.temp - KELVIN);
        let hourDescription = hourData.weather[0].description;

        // console.log(hourTime, hourTemperature, hourIcon);

        // if current time is greater than or equals to hour_time means time is before or equals to now time
        if (data.current.dt * 1000 >= hourData.dt * 1000) {
            // console.log(nowIndex, new Date(data.current.dt * 1000), new Date(hourData.dt * 1000));
            // console.log(weather_now_time, hourTime);

            // so if time is equal then its now time so display Now
            if (weather_now_time === hourTime) {
                // and setting index value to nowIndex
                nowIndex = index;
                // console.log("same time", nowIndex);

                // appending data to html string
                htmlStr += `<div class="forecast-hourly">
                                <div class="forecast-hourly__time">Now</div>
                                <img src="" alt="weather icon image" class="forecast-hourly__icon">
                                <div class="forecast-hourly__temperature_outer_container">
                                    <div class="forecast-hourly__temperature temp_value">${hourTemperature}</div><pre class="temp_unit"> °C</pre>
                                </div>
                                <div class="forecast-hourly__description">${hourDescription}</div>
                            </div>`;
            }

        }   // else if till nowIndex is not set means current time is lesser than or equals to hour_time
        else if (nowIndex == undefined && data.current.dt * 1000 <= hourData.dt * 1000) {
            // console.log("else if", nowIndex, new Date(data.current.dt * 1000), new Date(hourData.dt * 1000));
            // console.log(weather_now_time, hourTime);

            // so if time is equal then its now time so display Now
            if (weather_now_time === hourTime) {
                // and setting index value to nowIndex
                nowIndex = index;
                // console.log("same time", nowIndex);

                htmlStr += `<div class="forecast-hourly">
                                <div class="forecast-hourly__time">Now</div>
                                <img src="" alt="weather icon image" class="forecast-hourly__icon">
                                <div class="forecast-hourly__temperature_outer_container">
                                    <div class="forecast-hourly__temperature temp_value">${hourTemperature}</div><pre class="temp_unit"> °C</pre>
                                </div>
                                <div class="forecast-hourly__description">${hourDescription}</div>
                            </div>`;
            }

        }   // else if nowIndex is not yet set to undefined so we display next hours from now time and if 
        // nowIndex is set to undefined means hour time is lesser than current hour time
        else if (nowIndex != undefined) {
            // console.log("else", nowIndex, new Date(data.current.dt * 1000), new Date(hourData.dt * 1000));

            htmlStr += `<div class="forecast-hourly">
                            <div class="forecast-hourly__time">${hourTime}</div>
                            <img src="" alt="weather icon image" class="forecast-hourly__icon">
                            <div class="forecast-hourly__temperature_outer_container">
                            <div class="forecast-hourly__temperature temp_value">${hourTemperature}</div><pre class="temp_unit"> °C</pre>
                            </div>
                            <div class="forecast-hourly__description">${hourDescription}</div>
                        </div>`;

        }
    }

    // setting html string data to website
    forecast_hourly_container.innerHTML = htmlStr;

    // now for icon image fetching reference
    const forecast_hourly_icon = document.querySelectorAll(".forecast-hourly-container .forecast-hourly__icon");

    // and if nowIndex is == 1 then for forecast_hourly_icon we start from index-1 that is 0 else it will start from 1 and it is error
    if (nowIndex == 1) {
        for (let index = nowIndex; index < 25; index++) {
            let hourData = data.hourly[index];

            let hourIcon = hourData.weather[0].icon;
            let hourId = hourData.weather[0].id;
            // console.log(nowIndex);

            setWeatherIcon(hourIcon, hourId, forecast_hourly_icon[index - 1]);
        }
    }
    else {
        for (let index = nowIndex; index < 25; index++) {
            let hourData = data.hourly[index];

            let hourIcon = hourData.weather[0].icon;
            let hourId = hourData.weather[0].id;
            // console.log(nowIndex);

            setWeatherIcon(hourIcon, hourId, forecast_hourly_icon[index]);
        }
    }
}
// HOURLY WEATHER FORECAST SECTION - END


// WEEKLY WEATHER FORECAST SECTION - START
function DisplayWeeklyForecastWeather(data) {
    let htmlStr = "";

    data.daily.forEach((data, index) => {
        let weekDay = formatWeekDay(data.dt);
        let weekMaxTemperature = Math.round(data.temp.max - KELVIN);
        let weekMinTemperature = Math.round(data.temp.min - KELVIN);
        let weekDescription = data.weather[0].description;

        // console.log(weekDay, weekMaxTemperature, weekMinTemperature, weekIcon);

        // index == 0 is today
        if (index == 0) {
            htmlStr += `<div class="forecast-weekly">
                            <div class="forecast-weekly__day">Today</div>
                            <img src="" alt="weather icon image" class="forecast-weekly__icon">
                            <div class="forecast-weekly__temperature_outer_container">
                                <div class="forecast-weekly__max_temperature temp_value">${weekMaxTemperature}</div>
                                <pre class="temp_unit"> °C</pre>
                                <pre class="SLASH"> / </pre>
                                <div class="forecast-weekly__min_temperature temp_value">${weekMinTemperature}</div>
                                <pre class="temp_unit"> °C</pre>
                            </div>
                            <div class="forecast-weekly__description">${weekDescription}</div>
                        </div>`;

        } else {
            htmlStr += `<div class="forecast-weekly">
                            <div class="forecast-weekly__day">${weekDay}</div>
                            <img src="" alt="weather icon image" class="forecast-weekly__icon">
                            <div class="forecast-weekly__temperature_outer_container">
                                <div class="forecast-weekly__max_temperature temp_value">${weekMaxTemperature}</div>
                                <pre class="temp_unit"> °C</pre>
                                <pre class="SLASH"> / </pre>
                                <div class="forecast-weekly__min_temperature temp_value">${weekMinTemperature}</div>
                                <pre class="temp_unit"> °C</pre>
                            </div>
                            <div class="forecast-weekly__description">${weekDescription}</div>
                        </div>`;

        }

    });

    forecast_weekly_container.innerHTML = htmlStr;

    const forecast_weekly_icon = document.querySelectorAll(".forecast-weekly-container .forecast-weekly__icon");

    data.daily.forEach((data, index) => {
        let weekIcon = data.weather[0].icon;
        let weekId = data.weather[0].id;
        setWeatherIcon(weekIcon, weekId, forecast_weekly_icon[index])
    });

    // once our hourly and weekly forecast data is set we call addActiveClass() which will display forecast container section
    addActiveClass();
}
// WEEKLY WEATHER FORECAST SECTION - END


// Creating Location API object
const locationApi = {
    key: "pk.6c4f7e9efb0ebdbdc59548d97ce371c3",
    base_url: "https://us1.locationiq.com/v1/"
}


// GET LOCATION NAME FROM LATITUDE AND LONGITUDE CO-ORDINATES - START
// Reverse Geocoding
// When we coordinates from browser geolocation so to get location name from coordinates we call this 
// function and it will set location name to website
function getLocationNameFromCoords(latitude, longitude) {
    
    fetch(`${locationApi.base_url}reverse.php?key=${locationApi.key}&lat=${latitude}&lon=${longitude}&format=json`)
    .then(location => {
        let data = location.json();
        return data;
    }).then(data => {
        locationHtmlStr = `${data.address.city}, ${data.address.state}, ${data.address.country}`;
        weather_info__city_country.innerHTML = locationHtmlStr;
        // console.log(locationHtmlStr);
    });
}
// GET LOCATION NAME FROM LATITUDE AND LONGITUDE CO-ORDINATES - END


// GET LATITUDE AND LONGITUDE CO-ORDINATES FROM LOCATION NAME - START
// Forward Geocoding
// When user types location name in search box we get name and from name we want coordinates so we call this 
// function and after getting coordinates we call FetchWeather() to fetch weather of location typed
function getCoordsFromLocationName(searchStr) {
    // console.log(searchStr);

    fetch(`${locationApi.base_url}search.php?key=${locationApi.key}&q=${searchStr}&format=json`)
        .then(location => {
            let data = location.json();
            return data;
        }).then(data => {
            // console.log(data);
            latitude = data[0].lat;
            longitude = data[0].lon;
            FetchWeather(latitude, longitude);
            weather_info__city_country.innerHTML = data[0].display_name;
            // console.log(latitude, longitude);
        }).catch((error) => {
            locationtxt = "Please search for a valid city or country name 😩";
            showNotificationContainer();
            notification_container.innerHTML = locationtxt;
            console.log(error);
        });
}
// GET LATITUDE AND LONGITUDE CO-ORDINATES FROM LOCATION NAME - END


// SEARCH BAR FUNCTIONALITY - START
search_btn.addEventListener("click", () => {
    let searchStr = search_box.value;
    // console.log(searchStr);
    if (searchStr.length > 2) {
        getCoordsFromLocationName(searchStr);
        search_box.value = "";
    }
});

search_box.addEventListener("keyup", event => {
    // Number 13 is the code for "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // console.log('Enter is pressed!');
        search_btn.click();
    }
});
// SEARCH BAR FUNCTIONALITY - END


// TOGGLE BUTTTON FUNCTIONALITY. WHEN THE USER CLICKS ON THE TOGGLE BUTTTON CELSIUS AND FAHRENHEIT - START

// CONVERTING CELSIUS TO FAHRENHEIT
function celsiusToFahrenheit(temperature) {
    return Math.round(temperature * 9 / 5) + 32;
}

// CONVERTING FAHRENHEIT TO CELSIUS
function fahrenheitToCelsius(temperature) {
    return Math.round((temperature - 32) * 5 / 9);
}

// Adding Event Listener to toggle button when it gets changed then fetching all temperature values and units 
// from website and from temperature object's unit property we are checking if unit is equals to celsius then 
// then we have to convert to fahrenheit, so now we are changing temperature values and units in website to 
// fahrenheit and else if temperature object's unit property is fahrenheit then convert to celsius
toggle_button_checkbox.addEventListener("change", function () {
    temp_value = document.querySelectorAll(".temp_value");
    temp_unit = document.querySelectorAll(".temp_unit");

    if (temperature.unit == "celsius") {

        temp_value.forEach(value => {
            let fahrenheit = celsiusToFahrenheit(value.innerHTML);
            // console.log(value.innerHTML, "°C");

            value.innerHTML = fahrenheit;
        });

        temp_unit.forEach(unit => {
            unit.innerText = " °F";
        });

        // once temperature is converted to fahrenheit we are changing temperature object's unit property to
        //  fahrenheit so again toggle button clicked we can convert to celsius
        temperature.unit = "fahrenheit";
    } else {

        temp_value.forEach(value => {
            let celsius = fahrenheitToCelsius(value.innerHTML);
            // console.log(value.innerHTML, "°F");

            value.innerHTML = celsius;
        });

        temp_unit.forEach(unit => {
            unit.innerText = " °C";
        });

        temperature.unit = "celsius";
    }


});
// TOGGLE BUTTTON FUNCTIONALITY. WHEN THE USER CLICKS ON THE TOGGLE BUTTTON CELSIUS AND FAHRENHEIT - END


// FORECAST WEATHER TABS FUNCTIONALITY - START
// for all tab buttons we are adding click event and calling ontabclick() when clicked
for (let i = 0; i < tab_btn.length; i++) {
    tab_btn[i].addEventListener('click', onTabClick);
}

function onTabClick(event) {

    // firstly remove active-tab class from all tab buttons
    for (let i = 0; i < tab_btn.length; i++) {
        tab_btn[i].classList.remove("active-tab");
    }

    // then remove active-tab-content class from all tab content
    for (let i = 0; i < tab_content.length; i++) {
        tab_content[i].classList.remove("active-tab-content");
    }

    // adding active-tab class to clicked tab button
    event.target.classList.add('active-tab');
    // we have set data-forecast_type attribute which is data attribute and we can access it using dataset.forecast_type
    const forecast_type = event.target.dataset.forecast_type;
    // console.log(forecast_type);
    // forecast_type has value and to tab-content we have set id same as forecast_type value so fetching that tab-content
    const forecast_type_element = document.getElementById(forecast_type);
    // and adding active-tab-content class to that tab-content
    forecast_type_element.classList.add("active-tab-content");
}
// FORECAST WEATHER TABS FUNCTIONALITY - END


// UTILITY FUNCTIONS - START

// ERROR MESSAGE NOTIFICATION CONTAINER - START
// Displaying error message notification
function showNotificationContainer() {
    notification_container.classList.add("show-notification-container");

    hideNotificationContainer();
}

// Hiding error message notification after 2 seconds
function hideNotificationContainer() {
    setTimeout(() => {
        notification_container.classList.remove("show-notification-container");
    }, 2000);
}
// ERROR MESSAGE NOTIFICATION CONTAINER - END


// FORMAT DATE - START
function formatDate(unixDate) {
    const milliseconds = unixDate * 1000;   // converting date in seconds that we got from api to milliseconds
    const newDate = new Date(milliseconds); // this will set date from milliseconds
    
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    
    // toLocaleDateString() will format date as british date format also with taking options argument
    const finalDate = newDate.toLocaleDateString(["en-GB"], options);
    return finalDate;
}
// FORMAT DATE - END


// FORMAT TIME - START
function formatTime(unixTime) {
    const unixTimeMilliseconds = unixTime * 1000;   // converting date in seconds that we got from api to milliseconds
    const newTime = new Date(unixTimeMilliseconds); // this will set date from milliseconds
    
    const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    };
    
    // toLocaleTimeString() will format time as 12 hour format AM/PM
    const finalTime = newTime.toLocaleTimeString([], options);
    return finalTime;
}
// FORMAT TIME - END


// FORMAT HOURTIME - START
// formatHourTime() will set time to 12 hour format AM/PM and only hours no minutes
function formatHourTime(unixTime) {
    const unixTimeMilliseconds = unixTime * 1000;
    const newTime = new Date(unixTimeMilliseconds);
    const options = {
        hour: "2-digit",
        hour12: true
    };
    
    const finalTime = newTime.toLocaleTimeString([], options);
    return finalTime;
}
// FORMAT HOURTIME - END


// FORMAT WEEKDAY - START
function formatWeekDay(unixDate) {
    const milliseconds = unixDate * 1000;
    const newDate = new Date(milliseconds);
    const options = {
        weekday: "long",
    };
    
    const finalDate = newDate.toLocaleDateString([], options);
    return finalDate;
}
// FORMAT WEEKDAY - END


// DISPLAY WEATHER ICON - START
function setWeatherIcon(icon, id, imgElem) {
    let currentIcon;

    if (id === 210 || id === 211 || id === 212 || id === 221) {
        if (icon === "11d") {
            currentIcon = "11d_thunderstorm";
        } else {
            currentIcon = "11n_thunderstorm";
        }
    }
    else if (id === 600 || id === 601) {
        currentIcon = "13_snow";
    }
    else if (id === 602) {
        currentIcon = "13_heavy_snow";
    }
    else if (id === 620 || id === 621 || id === 622) {
        if (icon === "13d") {
            currentIcon = "13d_shower_snow";
        } else {
            currentIcon = "13n_shower_snow";
        }
    }
    else if (id === 701) {
        currentIcon = "50_mist";
    }
    else if (id === 711) {
        currentIcon = "50_smoke";
    }
    else if (id === 721) {
        currentIcon = "50_haze";
    }
    else if (id === 731) {
        currentIcon = "50_dust_whirls";
    }
    else if (id === 741) {
        currentIcon = "50_fog";
    }
    else if (id === 751) {
        currentIcon = "50_sand";
    }
    else if (id === 761) {
        currentIcon = "50_dust";
    }
    else if (id === 762) {
        currentIcon = "50_volcanic_ash";
    }
    else if (id === 771) {
        currentIcon = "50_squalls";
    }
    else if (id === 781) {
        currentIcon = "50_tornado";
    }
    else {
        currentIcon = icon;
    }

    // console.log(currentIcon, id, imgElem);
    displayWeatherIcon(currentIcon, imgElem)
}

function displayWeatherIcon(icon, imgElem) {
    imgElem.src = `images/weather_icons_svg/${icon}.svg`;
}
// DISPLAY WEATHER ICON - END


// Adding active class to display elements
function addActiveClass() {
    toggle_button.classList.add("active");
    weather_main.classList.add("active");
    bg_image1.classList.add("active");
    bg2.classList.add("active");
}

// UTILITY FUNCTIONS - END