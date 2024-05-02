// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      0.3
// @description  Get Vid_ID
// @icon64       https://raw.githubusercontent.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/master/icon.png
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
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
    const getVidIDUrl = [];
    const getArrayAtobElement = [];

    document.querySelectorAll("script").forEach(element => {
        if (urlRe.exec(window.location.href) && (atobRe.exec(element.textContent))) {
            getVidIDUrl.push(urlRe.exec(window.location.href)[1]);
            getArrayAtobElement.push(atobRe.exec(element.textContent)[1]);
        };
    });

    if (getVidIDUrl.length) {
        GM_setValue("vidID", Array.from(new Set(getVidIDUrl)));
        GM_setValue("arrayAtobElement", Array.from(new Set(getArrayAtobElement)));
        GM_registerMenuCommand("Get Vid_ID", getVidID, "G");
    };

    function getVidID() {
        const vidID = GM_getValue("vidID", null);
        const arrayAtobElement = GM_getValue("arrayAtobElement", null);

        for (const atobElement of arrayAtobElement) {
            const json = JSON.parse(atob(atobElement));
            const jsonID = json.id;
            const jsonDomain = json.domain;

            alert(`Copy Vid_ID: ${vidID}                                                                 Referer: https://abysscdn.com/?v=${vidID}                                   Domain: ${jsonDomain}/${jsonID}`);
        };
    };
})();
