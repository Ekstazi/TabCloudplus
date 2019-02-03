window.Storage = (function(){
    return {
        get: function (key) {
            var result = localStorage.getItem(key);
            result = JSON.parse(result);
            result = result || {};
            // result.tempWindowNames = result.tempWindowNames || {};
            // result.trackedWindows = result.trackedWindows || {};
            console.log('data get: ' + key, result);
            return result;
        },
        set: function (key, value) {
            console.log('data set: ' + key, value, JSON.stringify(value));
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
})();