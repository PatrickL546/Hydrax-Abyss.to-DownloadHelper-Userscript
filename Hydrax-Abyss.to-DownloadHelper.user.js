// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      1.8
// @description  Downloads Hydrax/Abyss.to videos
// @icon64       https://raw.githubusercontent.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/master/icon.png
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @author       PatrickL546
// @match        *://*/*
// @updateURL    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @downloadURL  https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @supportURL   https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/issues
// ==/UserScript==

(function () {
    'use strict';

    const urlRe = /\?v=([0-9A-Za-z_-]+)/;
    const jwRe = /jwplayer/;
    const atobRe = /PLAYER\(atob\("(.*)"\)\)/;
    const pieceRe = /({"pieceLength.+?})/;

    let vidID;
    let url1080;
    let url720;
    let url480_360;
    let referer;
    let info;

    document.querySelectorAll('script').forEach(element => {
        if (urlRe.exec(window.location.href) &&
            jwRe.exec(element.textContent) &&
            atobRe.exec(element.textContent) &&
            pieceRe.exec(element.textContent)) {

            vidID = urlRe.exec(window.location.href)[1];

            const pieceElement = pieceRe.exec(element.textContent)[1];
            const pieceJson = JSON.parse(pieceElement);

            const atobElement = atobRe.exec(element.textContent)[1];
            const atobJson = JSON.parse(atob(atobElement));

            url1080 = `https://${atobJson.domain}/whw${atobJson.id}`;
            url720 = `https://${atobJson.domain}/www${atobJson.id}`;
            url480_360 = `https://${atobJson.domain}/${atobJson.id}`;
            referer = `https://abysscdn.com/?v=${vidID}`;

            info = `Vid_ID: ${vidID}\nReferer: ${referer}\nUrl_1080: ${url1080}\nUrl_720: ${url720}\nUrl_480_360: ${url480_360}`;

            const foundVidID = GM_getValue('foundVidID', '');
            if (foundVidID.length == 0) {
                GM_setValue('foundVidID', vidID);
            } else {
                if (!foundVidID.includes(vidID)) {
                    GM_setValue('foundVidID', foundVidID.concat(' ', vidID));
                };
            };

            if (pieceJson.fullHd) {
                GM_registerMenuCommand('Download 1080p', download1080, 'D');
            };
            if (pieceJson.hd) {
                GM_registerMenuCommand('Download 720p', download720, 'W');
            };
            if (pieceJson.mHd) {
                GM_registerMenuCommand('Download 480p', download480, 'N');
            };
            if (pieceJson.sd) {
                GM_registerMenuCommand('Download 360p', download360, 'A');
            };

            GM_registerMenuCommand('Copy Info', copyInfo, 'F');
            GM_registerMenuCommand('Copy Vid_ID', copyVidID, 'V');
            GM_registerMenuCommand('Copy Vid_ID List', copyVidIDList, 'C');
            GM_registerMenuCommand('Clear Vid_ID List', clearVidIDList, 'E');
        };
    });

    function createProgressBar(download) {
        const container = document.createElement('div');
        container.id = 'DownloadHelper-progress-container';
        container.style.backgroundColor = '#1F1F1F';
        container.style.width = '100%';
        container.style.position = 'fixed';
        container.style.zIndex = '100000000';

        const text = document.createElement('div');
        text.id = 'DownloadHelper-progress-text';
        text.style.fontFamily = 'Arial, Helvetica, sans-serif';
        text.style.color = 'rgba(255, 255, 255, 0.8)';
        text.style.textShadow = 'black 0 0 0.3em';
        text.style.fontSize = '4vh';
        text.style.lineHeight = '5vh';
        text.style.textAlign = 'center';
        text.style.width = '100%';
        text.style.position = 'fixed';
        text.style.cursor = 'pointer';

        const progressBar = document.createElement('div');
        progressBar.id = 'DownloadHelper-progress-bar';
        progressBar.style.backgroundColor = '#44D62C';
        progressBar.style.width = '0';
        progressBar.style.height = '5vh';

        const button = document.createElement('button');
        button.id = 'DownloadHelper-cancel-button';
        button.className = 'jw-settings-content-item';
        button.textContent = 'Cancel';
        button.style.backgroundColor = '#333333';
        button.style.fontWeight = 'bold';
        button.style.fontSize = '4vh'
        button.style.width = '11vw';
        button.style.height = '6vh';
        button.style.padding = '0';
        button.style.border = '0';
        button.style.position = 'fixed';
        button.onclick = () => { download.abort() };

        container.appendChild(text);
        container.appendChild(progressBar);
        container.appendChild(button);
        document.body.prepend(container);
    };

    function getSize(size) {
        const sizes = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB', ' RB', ' QB'];

        for (let i = 1; i < sizes.length; i++) {
            if (size < Math.pow(1024, i)) {
                return (size / Math.pow(1024, i - 1)).toFixed(2) + sizes[i - 1];
            };
        };
        return size + sizes[0];
    };

    function download(url, name) {
        const download = GM_download({
            url: url,
            name: name,
            headers: { 'referer': referer },
            onprogress: (progress) => {
                const progressBar = document.getElementById('DownloadHelper-progress-bar');
                const percent = (progress.loaded / progress.total) * 100;
                progressBar.style.width = `${percent}%`;

                const progressText = document.getElementById('DownloadHelper-progress-text');
                progressText.textContent = `(${percent.toFixed(2)}%) ${getSize(progress.loaded)} / ${getSize(progress.total)}`;
            },
            onerror: (err) => {
                console.warn(err);
                alert(`Download error: ${err.error}\nReason: ${JSON.stringify(err.details)}`);
                document.getElementById('DownloadHelper-progress-container').remove();
            },
            onload: () => {
                document.getElementById('DownloadHelper-progress-container').remove();
            },
        });
        createProgressBar(download);
    };

    function download1080() {
        download(url1080, `${vidID}_1080.mp4`);
    };

    function download720() {
        download(url720, `${vidID}_720.mp4`);
    };

    function download480() {
        download(url480_360, `${vidID}_480.mp4`);
    };

    function download360() {
        download(url480_360, `${vidID}_360.mp4`);
    };

    function copyInfo() {
        GM_setClipboard(info);
        console.log(info);
        alert(info);
    };

    function copyVidID() {
        GM_setClipboard(vidID);
        console.log(vidID);
        alert(`Copied "${vidID}" to clipboard`);
    };

    function copyVidIDList() {
        const foundVidID = GM_getValue('foundVidID', '');
        GM_setClipboard(foundVidID);
        console.log(foundVidID);
        let foundCount;
        if (foundVidID) {
            foundCount = foundVidID.split(' ').length;
        } else {
            foundCount = 0;
        };
        alert(`Found ${foundCount} Vid_ID\nCopied "${foundVidID}" to clipboard`);
    };

    function clearVidIDList() {
        GM_setValue('foundVidID', '');
        console.log('Cleared Vid_ID List');
        alert('Cleared Vid_ID List');
    };
})();
