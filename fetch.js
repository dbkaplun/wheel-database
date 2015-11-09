#!/usr/bin/env node

var Nightmare = require('nightmare');
var Promise = require('bluebird');
var vo = require('vo');

trim.surroundingWhitespaceRegex = /^\s+|\s+$/g;
function trim (str) {
  return str.replace(trim.surroundingWhitespaceRegex, '');
}

var fetchAndysAutoSport = Promise.promisify(vo(function* () {
  var nightmare = Nightmare();
  var table = yield nightmare
    .goto(fetchAndysAutoSport.url)
    .wait(fetchAndysAutoSport.tableSelector)
    .evaluate(function (tableSelector) {
      return [].map.call(document.querySelectorAll(tableSelector+' tr'), function (tr) {
        return [].map.call(tr.querySelectorAll('td'), function (td) {
          return td.innerText;
        });
      });
    }, fetchAndysAutoSport.tableSelector);
  yield nightmare.end();
  return table;
}));
fetchAndysAutoSport.url = 'http://www.andysautosport.com/learning_center/buyers_guides/wheel_weights/';
fetchAndysAutoSport.tableSelector = 'table';


fetchWheelDatabase.lastUpdateRegex = /^LAST UPDATE:\s*(\S+)/;
fetchWheelDatabase.kgToLbs = 2.20462;
fetchWheelDatabase.kgToLbsEpsilon = .0001;
function fetchWheelDatabase () {
  var header;
  return fetchAndysAutoSport().then(function (rows) {
    return rows.reduce(function (result, row, i) {
      if (!i) header = row.map(trim);
      else if (header.length === row.length) {
        var wheel = row.reduce(function (wheel, cell, i) {
          cell = trim(cell);
          switch (header[i]) {
            case "Name": wheel.name = cell; break;
            case "Manufacturing Method": wheel.mfgMethod = cell; break;
            case "Size":
              var size = cell.match(/^(.*)x(.*)$/) || [];
              wheel.diameterInches = Number(size[1]);
              wheel.widthInches = Number(size[2]);
              break;
            case "Weight (lbs.)": wheel.weightLbs = Number(cell); break;
            case "Weight (kgs.)": wheel.weightKg = Number(cell); break;
            default: throw new Error("unknown header: "+header);
          }
          return wheel;
        }, {});
        if (Math.abs(wheel.weightLbs - (wheel.weightKg * fetchWheelDatabase.kgToLbs)) > fetchWheelDatabase.kgToLbsEpsilon) throw new Error("wheel lbs ("+wheel.weightLb+") and kg ("+wheel.weightKg+") don't match");
        delete wheel.weightKg; // redundant
        result.wheels.push(wheel);
      } else if (row.some(Boolean)) {
        var match = row[0].match(fetchWheelDatabase.lastUpdateRegex);
        if (match) result.lastUpdate = new Date(match[1]);
        else throw new Error("unknown row: "+JSON.stringify(row));
      }
      // else empty row
      return result;
    }, {
      wheels: [],
      lastUpdate: null
    });
  });
}

if (require.main === module) fetchWheelDatabase()
  .then(function (wheels) { return JSON.stringify(wheels, null, '  '); })
  .then(console.log);

module.exports = fetchWheelDatabase;
