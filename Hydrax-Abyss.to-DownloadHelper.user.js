// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      1.4
// @description  Downloads Hydrax/Abyss.to videos
// @icon64       https://raw.githubusercontent.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/master/icon.png
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
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
            (jwRe.exec(element.textContent)) &&
            (atobRe.exec(element.textContent)) &&
            (pieceRe.exec(element.textContent))) {

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

            if (pieceJson.fullHd) {
                GM_registerMenuCommand('Download 1080p', download1080, 'D');
            };
            if (pieceJson.hd) {
                GM_registerMenuCommand('Download 720p', download720, 'W');
            };
            if (pieceJson.mHd) {
                GM_registerMenuCommand('Download 480p', download480, 'A');
            };
            if (pieceJson.sd) {
                GM_registerMenuCommand('Download 360p', download360, 'N');
            };

            GM_registerMenuCommand('Show Info', showInfo, 'S');
            GM_registerMenuCommand('Copy Info', copyInfo, 'C');
            GM_registerMenuCommand('Copy Vid_ID', copyVidID, 'V');
        };
    });

    function createProgressBar(download) {
        const container = document.createElement('div');
        container.id = 'DownloadHelper-progress-container';
        container.style.backgroundColor = '#1F1F1F';
        container.style.position = 'fixed';
        container.style.width = '100%';
        container.style.zIndex = '100000000';

        const text = document.createElement('div');
        text.className = 'jw-settings-content-item';
        text.id = 'DownloadHelper-progress-text';
        text.style.fontFamily = 'Arial, Helvetica, sans-serif';
        text.style.color = 'rgba(255, 255, 255, 0.8)';
        text.style.textShadow = 'black 1px 1px 3px';
        text.style.textAlign = 'center';
        text.style.position = 'fixed';
        text.style.padding = '0';

        const progressBar = document.createElement('div');
        progressBar.id = 'DownloadHelper-progress-bar';
        progressBar.style.backgroundColor = '#44D62C';
        progressBar.style.height = '3vh';
        progressBar.style.width = '0';

        const button = document.createElement('button');
        button.className = 'jw-reset jw-settings-content-item';
        button.textContent = 'Cancel';
        button.style.fontWeight = 'bold';
        button.style.backgroundColor = '#333333';
        button.style.position = 'fixed';
        button.style.width = '69.3594px'
        button.onclick = () => { download.abort() };

        container.appendChild(text);
        container.appendChild(progressBar);
        container.appendChild(button);
        document.body.prepend(container);
    };

    function getSize(size) {
        let sizes = [' Bytes', ' KB', ' MB', ' GB',
            ' TB', ' PB', ' EB', ' ZB', ' YB'];

        for (let i = 1; i < sizes.length; i++) {
            if (size < Math.pow(1024, i))
                return (Math.round((size / Math.pow(
                    1024, i - 1)) * 100) / 100).toFixed(2) + sizes[i - 1];
        }
        return size;
    };

    function download(url, name) {
        const download = GM_download({
            url: url,
            name: name,
            headers: { 'referer': referer },
            onprogress: (progress) => {
                const progressBar = document.getElementById('DownloadHelper-progress-bar');
                const percent = (progress.loaded / progress.total) * 100;
                const progressText = document.getElementById('DownloadHelper-progress-text');
                progressText.textContent = (`${getSize(progress.loaded)} / ${getSize(progress.total)}`)
                progressBar.style.width = `${percent}%`;
            },
            onerror: (err) => {
                console.log(err);
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
    function showInfo() {
        alert(info);
    };
    function copyInfo() {
        GM_setClipboard(info);
        alert('Copied info to clipboard');
    };
    function copyVidID() {
        GM_setClipboard(vidID);
        alert(`Copied "${vidID}" to clipboard`);
    };
})();
