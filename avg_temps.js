'use strict'

var fs = require('fs');
var async = require('async');
import Nightmare from 'nightmare';

const locationTerms = [
  "Argentina	Buenos Aires",
  "Australia	Sydney",
  {
    search: "Río Gallegos",
    additional: "Patagonia (lowest south)"
  },
  {
    search: "Argentina	Comodoro Rivadavia",
    additional: "Patagonia (midway down)"
  },
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
  {
    search: "Japan	Sapporo",
    additional: "Hokkaido"
  },
  "Japan	Kumamoto",
  "Japan	Kyoto",
  {
    search: "Japan	Fukuoka",
    additional: "Kyushu"
  },
  "Japan	Osaka",
  "Japan	Sapporo",
  "Japan	Tokyo",
  "Kenya	Mombasa",
  "Kenya	Nairobi",
  "Korea	Seoul",
  "Laos	Vientiane",
  "Malaysia	Kuala Lumpur",
  "Singapore",
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
  "Vietnam	Hue",
  {
    search: "Vietnam Thuận An",
    additional: 'Ho Chi Minh'
  }
];
// "Japan	Koyasan", // Koya https://www.worldweatheronline.com/lang/en-us/koyasan-weather-averages/wakayama/jp.aspx
//"Galapagos	Puerto Baquerizo Moreno", // https://www.quasarex.com/galapagos/climate-and-weather
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
  switches: ["http://fixie:g7cFcISscxDu9fX@velodrome.usefixie.com:80"],
  show: true
});

function load(locationTerm, cb) {
  nightmare.goto(
      `https://www.google.com/search?q=average+temperature+"${encodeURIComponent(typeof locationTerm === 'string' ? locationTerm : locationTerm.search)}"&oq=average+temperature`
    )
    .wait(80)
    .click('g-tabs > div > div > div:last-child') // Click 'Graphs'
    .wait(120)
    .evaluate(function() {
      const locationText = document.querySelector(
          '.liveresults-climate__header-location')
        .innerText;

      return {
        city: locationText.split(',')[0],

        country: locationText.split(',')
          .slice(-1)[0],

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
      result.desc = locationTerm.additional || '';
      locations.push(result);
      cb();
    }) // Finally, run the queue of commands specified
}

async.eachSeries(locationTerms, load, function(err) {
  if (err) {
    throw err;
  }
  var jsons = {
    highs: [],
    lows: [],
    precipitations: [],
    hours: []
  };

  for (let location of locations) {
    var rest = {
      highs: {},
      lows: {},
      precipitations: {},
      hours: {}
    };

    for (let i = 0; i < months.length; i++) {
      var label = months[i];
      for (let key of Object.keys(jsons)) {
        rest[key][label] = location[key][i];
      }
    }
    for (let key of Object.keys(jsons)) {
      jsons[key].push(Object.assign({
        city: location.city,
        country: location.country,
        desc: location.desc,
      }, rest[key]));
    }
  }
  nightmare.end();
  for (let key of Object.keys(jsons)) {
    fs.writeFile(`/tmp/avg-${key}.json`, JSON.stringify(jsons[key]), function (err) {
      console.log(err || "Write successful: " + key)
    });
  }
});
