// ==UserScript==
// @name         macro-thetical
// @namespace    http://paulbaker.io
// @version      0.5.9
// @description  Reads my macros, prints out how many I have left, and some hypothetical foods I can still eat with my allowance :)
// @author       Paul Nelson Baker
// @match        https://www.fitbit.com/foods/log
// @match        https://www.fitbit.com/foods/log/*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// @downloadURL  https://github.com/paul-nelson-baker/macro-thectical/raw/master/macro-thetical.user.js
// @updateURL    https://github.com/paul-nelson-baker/macro-thectical/raw/master/macro-thetical.user.js
// ==/UserScript==

/*
My macros are based on my body height/type/shape and my
fitness goals. Get yours from your personal trainer or online calculator :)

Here is a popular calculator: https://ketogains.com/ketogains-calculator/
*/
const maxValues = {
    fat: 133,
    carbs: 20,
    protein: 110,
    // I'm not sure why these are my weekly/daily totals.
    // The math doesn't quite add up.
    //
    // 1g fat = 9 Calories,
    // 1g Carbs or Protien = 4 calories.
    weeklyCalories: 12005,
    dailyCalories: 1715,
}

console.log('Using max macros', maxValues);

function parseMacroValue(macroJQuerySelector) {
    let currentMacroElement = $(macroJQuerySelector);
    let currentMacroText = currentMacroElement.text();
    let currentMacroValue = parseFloat(currentMacroText.replace(/\s+g/gi, ''))
    return currentMacroValue;
}

function getRemainingMacros(maxValues) {
    let fatSelector = '#dailyTotals > div > div:nth-child(3) > div > div.amount';
    let carbsSelector = '#dailyTotals > div.content.firstBlock > div:nth-child(5) > div > div.amount';
    let fiberSelector = '#dailyTotals > div.content.firstBlock > div:nth-child(4) > div > div.amount';
    let proteinSelector = '#dailyTotals > div.content.firstBlock > div:nth-child(7) > div > div.amount';
    return {
        'fat': maxValues.fat - parseMacroValue(fatSelector),
        'carbs': maxValues.carbs - parseMacroValue(carbsSelector) + parseMacroValue(fiberSelector),
        'protein': maxValues.protein - parseMacroValue(proteinSelector),
    };
}

function createRowContainer() {
    // Create all the rows
    let customRowsSelector = 'div#my-custom-rows';
    if ($(customRowsSelector).length === 0 || $(customRowsSelector).is(":hidden")) {
        $('div#dailyTotals').append('<div id="my-custom-rows"></div>');
        console.log('Creating row container', $(customRowsSelector)[0]);
    }
}

function createRow(rowElementId, rowInitializerCallback) {
    createRowContainer();

    let customRowsElement = $('div#my-custom-rows');
    let selector = 'div#' + rowElementId;
    if ($(selector).length === 0) {
        customRowsElement.append('<div id=' + rowElementId + ' class="content"></div>');
        let resultElement = $(selector);
        rowInitializerCallback(resultElement);
        console.log('Creating row inside container', resultElement[0]);
    }
}

function createColumn(substanceLabel, substanceAmount, substanceUnit=undefined) {
    let htmlValue = `
    <div class="total">
      <div class="label">
        <div class="substance">${substanceLabel}</div>
        <div class="amount">
          ${substanceAmount} ${substanceUnit === undefined ? '' : `<span class="unit"> ${substanceUnit}</span>`}
        </div>
       </div>
    </div>
    `;
    return $(htmlValue);
}

function initializeCustomRows() {
    // Maxes (to remind me), Remainders, Remainders in terms of EGGS <3!!!
    createRow('my-max', rowElement => {
        rowElement.append($('<h3>Max Macros</h3>'));
        rowElement.append(createColumn('Fat', maxValues.fat, 'g'));
        rowElement.append(createColumn('Net Carbs', maxValues.carbs, 'g'));
        rowElement.append(createColumn('Protein', maxValues.protein, 'g'));
    });

    createRow('my-remainders', rowElement => {
        const remainingMacros = getRemainingMacros(maxValues);
        rowElement.append($('<h3>Remaining Macros</h3>'));
        rowElement.append(createColumn('Fat', remainingMacros.fat, 'g'));
        rowElement.append(createColumn('Net Carbs', remainingMacros.carbs, 'g'));
        rowElement.append(createColumn('Protein', remainingMacros.protein, 'g'));
    });
    createRow('my-eggs', rowElement => {
        const remainingMacros = getRemainingMacros(maxValues);
        const remainingEggCount = Math.max(0, Math.floor(Math.min(remainingMacros.fat / 5, remainingMacros.protein / 6)));
        rowElement.append($('<h3>Remaining Foods!</h3>'));
        rowElement.append(createColumn('Whole Eggs', remainingEggCount, '🥚'))
    });
}

(function() {
    'use strict';
    setInterval(initializeCustomRows, 100);
    // initializeCustomRows();
})();
