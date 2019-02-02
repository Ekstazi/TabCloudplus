window.Favicon = (function(){
    /**
     * @param url
     * @returns {string}
     */
    function extractHostname(url)
    {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }
    var providerUrl = 'https://s2.googleusercontent.com/s2/favicons?domain_url=';
    return {
        getFavicon: function (url) {
            return providerUrl + extractHostname(url);
        },
        /**
         *
         * @param {string} url
         * @param {string} siteUrl
         * @returns {boolean}
         */
        isFaviconOf: function (url, siteUrl) {
            return url == providerUrl + extractHostname(siteUrl);
        }
    }
})();
