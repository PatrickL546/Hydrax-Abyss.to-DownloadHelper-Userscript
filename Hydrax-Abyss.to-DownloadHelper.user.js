// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      0.4
// @description  Get Vid_ID
// @icon64       https://raw.githubusercontent.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/master/icon.png
// @grant        GM_registerMenuCommand
// @author       PatrickL546
// @match        *://*/*
// @updateURL    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @downloadURL  https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @supportURL   https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/issues
// ==/UserScript==

(function () {
    'use strict';

    const urlRe = /\?v=([0-9A-Za-z_-]*)/;
    const atobRe = /PLAYER\(atob\("(.*)"\)\)/;
    const vidIDUrl = [];
    const arrayAtobElement = [];

    document.querySelectorAll("script").forEach(element => {
        if (urlRe.exec(window.location.href) && (atobRe.exec(element.textContent))) {
            vidIDUrl.push(urlRe.exec(window.location.href)[1]);
            arrayAtobElement.push(atobRe.exec(element.textContent)[1]);
            GM_registerMenuCommand("Get Vid_ID", getVidID, "G");
        };
    });

    function getVidID() {
        for (const atobElement of arrayAtobElement) {
            const json = JSON.parse(atob(atobElement));
            const jsonID = json.id;
            const jsonDomain = json.domain;

            alert(`Copy Vid_ID: ${vidIDUrl}                                                                 Referer: https://abysscdn.com/?v=${vidIDUrl}                                   Domain: ${jsonDomain}/${jsonID}`);
        };
    };
})();
