// ==UserScript==
// @name         Redmine Friendly Time
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Redmine shows friendly time in tickets
// @author       Massive Friendly Fire
// @match        http://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var mainRegex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;

    var metas = document.getElementsByTagName('meta');
    var isRedmine = false;
    var formatMilliseconds = function(milliseconds) {
        var minutes = parseInt((milliseconds/(1000*60))%60);
        var hours = parseInt((milliseconds/(1000*60*60))%24);
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        return hours + " ч. " + minutes + " мин.";
    };
    var getMillisecondsIfStringIsDate = function(string) {
        var matches = string.match(mainRegex);
        if (matches !== null) {
            var year = parseInt(matches[3], 10);
            var month = parseInt(matches[2], 10) - 1; // months are 0-11
            var day = parseInt(matches[1], 10);
            var hour = parseInt(matches[4], 10);
            var minute = parseInt(matches[5], 10);
            var second = 0;
            //check first format: dd.mm.yyyy hh:mm
            var parsedDate = new Date(year, month, day, hour, minute, second);
            if (parsedDate.getFullYear() === year || parsedDate.getMonth() == month || parsedDate.getDate() === day || parsedDate.getHours() === hour || parsedDate.getMinutes() === minute) {
                return Math.abs(currentTime - parsedDate);
            }
            //check second format: mm.dd.yyyy hh:mm
            parsedDate = new Date(year, day - 1, month + 1, hour, minute, second);
            if (parsedDate.getFullYear() === year || parsedDate.getMonth() == day - 1 || parsedDate.getDate() === month + 1 || parsedDate.getHours() === hour || parsedDate.getMinutes() === minute) {
                return Math.abs(currentTime - parsedDate);
            }
            //not found
        }
        return null;
    };

    //Run stage
    //check site is Redmine
    for (var s = 0; s < metas.length; s++) {
        if (metas[s].getAttribute("name") ==="description") {
            if (metas[s].getAttribute("content") === "Redmine") {
                isRedmine = true;
                break;
            }
        }
    }

    //iterate links and replace inner html if link matches date time
    if (isRedmine) {
        var links = document.getElementsByTagName("a");
        var currentTime = new Date();
        for (var i = 0; i < links.length; i++) {
            var milliseconds = getMillisecondsIfStringIsDate(links[i].title);
            if (milliseconds !== null) {
                links[i].innerHTML = formatMilliseconds(milliseconds);
            }
        }
    }
})();