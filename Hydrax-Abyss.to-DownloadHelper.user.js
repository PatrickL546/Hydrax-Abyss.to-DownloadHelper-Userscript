// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      0.1
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

    const urlRe = /\?v=([a-zA-Z0-9]*)/;
    const getVidIDUrl = [];

    if (urlRe.exec(window.location.href)) {
        getVidIDUrl.push(urlRe.exec(window.location.href)[1]);
    };

    if (getVidIDUrl.length) {
        GM_setValue("vidID", Array.from(new Set(getVidIDUrl)));
        GM_registerMenuCommand("Get Vid_ID", getVidID, "G");
    };

    function getVidID() {
        const vidID = GM_getValue("vidID", null);
        alert(`Copy Vid_ID: ${vidID}`);
        console.log(`Copy Vid_ID: ${vidID[0]}`);
    };
})();
