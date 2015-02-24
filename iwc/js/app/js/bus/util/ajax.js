/**
 * Utility methods used on the IWC bus.
 * @module bus
 * @submodule bus.util
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Sends an AJAX request. A promise is returned to handle the response.
 *
 * @method ajax
 * @static
 * @param {Object} config
 * @param {String} config.method
 * @param {String} config.href
 * @param [Object] config.headers
 * @param {String} config.headers.name
 * @param {String} config.headers.value
 * @param {boolean} config.withCredentials
 *
 * @returns {Promise}
 */
ozpIwc.util.ajax = function (config) {
    return new Promise(function(resolve,reject) {
        var request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open(config.method, config.href, true);
        if (Array.isArray(config.headers)) {
            config.headers.forEach(function(header) {
                request.setRequestHeader(header.name, header.value);
            });
        }
        /*
         * Setting username and password as params to open() (and setting request.withCredentials = true)
         * per the API does not work in FF. setting them explicitly in the Authorization header works
         * (but only for BASIC authentication as coded here). If the credentials are set in the open command,
         * FF will fail to make the request, even though the credentials are manually set in the Authorization header
         * */

        request.onload = function () {
            try {
                resolve({
                    "response": JSON.parse(this.responseText),
                    "header":  ozpIwc.util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders())
                });
            }
            catch (e) {
                if(this.status === 204 && !this.responseText){
                    resolve({
                        "response": {},
                        "header":  ozpIwc.util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders())
                    });
                } else {
                    reject(this);
                }
            }
        };

        request.onerror = function (e) {
            reject(this);
        };

        try {
            if ((config.method === "POST") || (config.method === "PUT")) {
                request.send(config.data);
            }
            else {
                request.send();
            }
        } catch (e) {
            reject(e);
        }
    });
};


/**
 * Takes the Javascript ajax response header (string) and converts it to JSON
 * @method ajaxResponseHeaderToJSON
 * @param {String} header
 *
 * @returns {Object}
 */
ozpIwc.util.ajaxResponseHeaderToJSON = function(header) {
    var obj = {};
    header.split("\n").forEach(function (property) {
        var kv = property.split(":");
        if (kv.length === 2) {
            obj[kv[0].trim()] = kv[1].trim();
        }
    });

    return obj;
};
