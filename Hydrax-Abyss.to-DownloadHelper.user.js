// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @version      1.1
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

    let vidID;
    let url1080;
    let url720;
    let url480_360;
    let referer;
    let info;

    document.querySelectorAll('script').forEach(element => {
        if (urlRe.exec(window.location.href) &&
            (jwRe.exec(element.textContent)) &&
            (atobRe.exec(element.textContent))) {

            vidID = urlRe.exec(window.location.href)[1];

            const atobElement = atobRe.exec(element.textContent)[1];
            const json = JSON.parse(atob(atobElement));

            url1080 = `https://${json.domain}/whw${json.id}`;
            url720 = `https://${json.domain}/www${json.id}`;
            url480_360 = `https://${json.domain}/${json.id}`;
            referer = 'https://abysscdn.com';

            info = `Vid_ID: ${vidID}\nReferer: ${referer}\nUrl_1080: ${url1080}\nUrl_720: ${url720}\nUrl_480_360: ${url480_360}`;

            GM_registerMenuCommand('Download 1080p', download1080, 'D');
            GM_registerMenuCommand('Download 720p', download720, 'W');
            GM_registerMenuCommand('Download 480p or 360p', download480_360, 'A');
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

        container.appendChild(progressBar);
        container.appendChild(button);
        document.body.prepend(container);
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
    function download480_360() {
        download(url480_360, `${vidID}_480_360.mp4`);
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
