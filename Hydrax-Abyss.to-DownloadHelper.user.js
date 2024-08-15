// ==UserScript==
// @name         Hydrax/Abyss.to DownloadHelper
// @namespace    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @author       PatrickL546
// @description  Downloads Hydrax/Abyss.to videos
// @icon         https://raw.githubusercontent.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/master/icon.png
// @downloadURL  https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @updateURL    https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/raw/master/Hydrax-Abyss.to-DownloadHelper.user.js
// @supportURL   https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper/issues
// @homepageURL  https://github.com/PatrickL546/Hydrax-Abyss.to-DownloadHelper
// @run-at       document-idle
// @match        *://*/*
// @connect      *
// @version      2.0
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    const urlRe = /v=([^\\?&]+)/;
    const jwPlayerRe = /iamcdn\.net\/player\/jwplayer/;
    const coreRe = /iamcdn\.net\/player\/core/;
    const aaEncodeRe = /(ﾟωﾟﾉ=.+?) \('_'\);/;

    const atobRe = /atob\("(.+?)"\)/;

    if (urlRe.test(location.href) &&
        jwPlayerRe.test(document.head.innerHTML) &&
        coreRe.test(document.body.innerHTML) &&
        aaEncodeRe.test(document.body.textContent)) {

        const encoded = document.body.textContent.match(aaEncodeRe)[1] + '.toString()';
        const decoded = eval?.(encoded);

        const atobJson = JSON.parse(atob(decoded.match(atobRe)[1]));
        const strAtobJson = JSON.stringify(atobJson);

        const vidID = atobJson.slug;
        const referer = 'https://abysscdn.com/';
        const url1080 = `https://${atobJson.domain}/whw${atobJson.id}`;
        const url720 = `https://${atobJson.domain}/www${atobJson.id}`;
        const url360 = `https://${atobJson.domain}/${atobJson.id}`;
        const info = `
Referer: ${referer}
Url_1080p: ${url1080}
Url_720p: ${url720}
Url_360p: ${url360}
atobJson: ${strAtobJson}
`;

        const foundVidID = GM_getValue('foundVidID', '');

        if (foundVidID.length == 0) {
            GM_setValue('foundVidID', vidID);
        } else {
            if (!foundVidID.includes(vidID)) {
                GM_setValue('foundVidID', foundVidID.concat(' ', vidID));
            };
        };

        if (strAtobJson.includes('1080p')) { GM_registerMenuCommand('Download 1080p', () => download(url1080, `${vidID}_1080p.${strAtobJson.match(/1080p.+?type":"(.+?)"/)[1]}`), 'D'); };
        if (strAtobJson.includes('720p')) { GM_registerMenuCommand('Download 720p', () => download(url720, `${vidID}_720p.${strAtobJson.match(/720p.+?type":"(.+?)"/)[1]}`), 'W'); };
        if (strAtobJson.includes('360p')) { GM_registerMenuCommand('Download 360p', () => download(url360, `${vidID}_360p.${strAtobJson.match(/360p.+?type":"(.+?)"/)[1]}`), 'A'); };

        if (atobJson) {
            GM_registerMenuCommand('Copy Vid_ID', copyVidID, 'V');
            GM_registerMenuCommand('Copy Vid_ID List', copyVidIDList, 'C');
            GM_registerMenuCommand('Copy Info', copyInfo, 'F');
            GM_registerMenuCommand('Clear Vid_ID List', clearVidIDList, 'E');
        };

        if (strAtobJson.includes('1080p')) { GM_registerMenuCommand('Requestly 1080p', () => GM_openInTab(url1080), 'R'); };
        if (strAtobJson.includes('720p')) { GM_registerMenuCommand('Requestly 720p', () => GM_openInTab(url720), 'Q'); };
        if (strAtobJson.includes('360p')) { GM_registerMenuCommand('Requestly 360p', () => GM_openInTab(url360), 'T'); };

        function copyInfo() {
            GM_setClipboard(info);

            console.log(info);
            alert(info);
        };

        function copyVidID() {
            GM_setClipboard(vidID);

            console.log(`Copied "${vidID}" to clipboard`);
            alert(`Copied "${vidID}" to clipboard`);
        };

        function copyVidIDList() {
            const foundVidID = GM_getValue('foundVidID', '');
            GM_setClipboard(foundVidID);

            let foundCount;
            if (foundVidID.length != 0) {
                foundCount = foundVidID.split(' ').length;
            } else {
                foundCount = 0;
            };

            console.log(`Found ${foundCount} Vid_ID\nCopied "${foundVidID}" to clipboard`);
            alert(`Found ${foundCount} Vid_ID\nCopied "${foundVidID}" to clipboard`);
        };

        function clearVidIDList() {
            GM_setValue('foundVidID', '');

            console.log('Cleared Vid_ID List');
            alert('Cleared Vid_ID List');
        };

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
            button.style.textAlign = 'center';
            button.style.fontWeight = 'bold';
            button.style.fontSize = '4vh';
            button.style.width = '11vw';
            button.style.height = '6vh';
            button.style.padding = '0';
            button.style.border = '0';
            button.style.position = 'fixed';
            button.onclick = () => { download.abort(); };

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

        async function download(url, name) {
            if (document.getElementById('DownloadHelper-progress-container')) {
                alert('Download already in progress');
                throw new Error('Download already in progress');
            }

            if (navigator.userAgent.match('Chrome')) {
                url = await GM.xmlHttpRequest({ url: url });

                const download = GM_download({
                    url: url.finalUrl,
                    name: name,
                    headers: { 'Referer': referer },
                    onprogress: (progress) => {
                        const progressBar = document.getElementById('DownloadHelper-progress-bar');
                        const percent = (progress.loaded / progress.total) * 100;
                        progressBar.style.width = `${percent}%`;

                        const text = document.getElementById('DownloadHelper-progress-text');
                        text.textContent = `(${percent.toFixed(2)}%) ${getSize(progress.loaded)} / ${getSize(progress.total)}`;
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

                const progressBar = document.getElementById('DownloadHelper-progress-bar');
                progressBar.style.backgroundColor = '#D22B2B';
                progressBar.style.width = '100%';
                progressBar.style.height = '15vh';

                const text = document.getElementById('DownloadHelper-progress-text');
                text.textContent = 'Click "Always allow all domains" to skip popup. Manifest V3 broke the script, waiting for Tampermonkey for a fix. This workaround might not work. I recommend using the Requestly option or the Python downloader.';
            } else if (navigator.userAgent.match('Firefox')) {
                const download = GM_download({
                    url: url,
                    name: name,
                    headers: { 'Referer': referer },
                    onprogress: (progress) => {
                        const progressBar = document.getElementById('DownloadHelper-progress-bar');
                        const percent = (progress.loaded / progress.total) * 100;
                        progressBar.style.width = `${percent}%`;

                        const text = document.getElementById('DownloadHelper-progress-text');
                        text.textContent = `(${percent.toFixed(2)}%) ${getSize(progress.loaded)} / ${getSize(progress.total)}`;
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
            } else {
                alert('Unsupported Browser');
            };
        };
    };
})();
