'use strict'

var async = require('async');
import Nightmare from 'nightmare';

const locationTerms = [
  "Argentina	Buenos Aires",
  //"Argentina	Puerto Natales",
  "Australia	Sydney",
  "Australia	Townsville",
  "Austria	Vienna",
  "Belgium	Brussels",
  "Cambodia	Phnom Penh",
  "China	Beijing",
  "China	Hong Kong",
  "China	Shanghai",
  "China	Xian",
  "Columbia	Bogota",
  "Columbia	Medellin",
  "Costa Rica	San Jose",
  "Croatia	Zagreb",
  "Denmark	Copenhagen",
  "Egypt	Cairo",
  "Finland	Helsinki",
  "France	Nice",
  "France	Paris",
  //"Galapagos	Puerto Baquerizo Moreno", // https://www.quasarex.com/galapagos/climate-and-weather
  "Germany	Munich",
  "Greece	Athens",
  "Greece	Santorini",
  "Iceland	Reykjavik",
  "India	Bangalor",
  "India	Mumbai",
  "India	New Delhi",
  "Israel	Tel Aviv",
  "Italy	Rome",
  "Japan	Hiroshima",
  {search: "Japan	Sapporo, additional: "Hokkaido"},
  // "Japan	Koyasan", // Koya https://www.worldweatheronline.com/lang/en-us/koyasan-weather-averages/wakayama/jp.aspx
  "Japan	Kumamoto",
  "Japan	Kyoto",
  {search: "Japan	Fukuoka", additional: "Kyushu"},
  "Japan	Osaka",
  "Japan	Sapporo",
  "Japan	Tokyo",
  "Kenya	Mombasa",
  "Kenya	Nairobi",
  "Korea	Seoul",
  "Laos	Vientiane",
  "Malaysia	Kuala Lumpur",
  "Malaysia	Singapore",
  "Morocco	Marrakesh",
  "Myanmar	Mandalay",
  "Nepal	Kathmandu",
  "Netherlands	Amsterdam",
  "New Zealand	Aukland",
  "New Zealand	Christchurch",
  "New Zealand	Queenstown",
  "New Zealand	Wellington",
  "Norway	Oslo",
  "Panama	Panama City",
  "Philippines	Manila",
  "Phillippines	Manila",
  "Portugal	Lisbon",
  "Russia	St. Petersburg",
  "South Africa	Cape Town",
  "Spain	Barcelona",
  "Sweden	Stockholm",
  "Switzerland	Zurich",
  "Taiwan	Taipei",
  "Thailand	Bangkok",
  "Thailand	Chiang Mai",
  "Turkey	Istanbul",
  "Turkey	Izmir",
  "Vietnam	Hanoi",
  //"Vietnam	Ho Chi Minh City",
  "Vietnam	Hue",
  "Vietnam	Saigon",
];
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var locations = [];
var highs = [];
var precipitations = [];
var hours = [];
var lows = [];

const nightmare = new Nightmare({
  show: true
});

function load(locationTerm, cb) {
  nightmare.goto(
      `https://www.google.com/search?q=average+temperature+"${encodeURIComponent(locationTerm)}"&oq=average+temperature`
    )
    .wait(500)
    .click('g-tabs > div > div > div:last-child') // Click 'Graphs'
    .wait(500)
    .evaluate(function() {
      const locationText = document.querySelector(
          '.liveresults-climate__header-location')
        .innerText;

      return {
        city: locationText.split(',')[0],

        country: locationText.split(',').slice(-1)[0],

        precipitations: (Array.prototype.slice.call(document.querySelectorAll(
            'svg.liveresults-climate__precipitation > text'), 0, 12)
          .map(function(t) {
            return t.innerHTML;
          })),

        hours: (Array.prototype.slice.call(document.querySelectorAll(
            'svg.liveresults-climate__day-length > text'), 0, 12)
          .map(function(t) {
            return t.innerHTML;
          })),

        highs: (Array.prototype.slice.call(document.querySelectorAll(
            'svg.liveresults-climate__temperature > text'), 0, 12)
          .map(function(t) {
            return t.innerHTML.replace('°', '');
          })),
        lows: (Array.prototype.slice.call(document.querySelectorAll(
            'svg.liveresults-climate__temperature > text'), 12, 24)
          .map(function(t) {
            return t.innerHTML.replace('°', '');
          })),
      }
    })
    .then(function(result) {
      locations.push(result);
      cb();
    }) // Finally, run the queue of commands specified
}

async.eachSeries(locationTerms, load, function(err) {
  if (err) {
    throw err;
  }
  console.log(JSON.stringify(locations));
  nightmare.end();
});
