(function(root) {

    if ( ! root['nano']) { root.nano = {}; }

    /**
     * String utility class.
     * 
     * @class nano.String
     * @extends Object
     * @singleton
     */
    nano.String = new function() {
        this.ucfirst = function(str) {
            return str.charAt(0).toUpperCase() + str.substr(1);
        };

        /**
         * ReplaceAll by Fagner Brack (MIT Licensed).
         * Replaces all occurrences of a substring in a string
         * @method
         * @public
         */
        this.replaceAll = function(token, newToken, ignoreCase) {
            var str, i = -1, _token;
            if((str = this.toString()) && typeof token === "string") {
                _token = ignoreCase === true? token.toLowerCase() : undefined;
                while((i = (
                    _token !== undefined? 
                        str.toLowerCase().indexOf(
                                    _token, 
                                    i >= 0? i + newToken.length : 0
                        ) : str.indexOf(
                                    token,
                                    i >= 0? i + newToken.length : 0
                        )
                )) !== -1 ) {
                    str = str.substring(0, i)
                            .concat(newToken)
                            .concat(str.substring(i + token.length));
                }
            }
            return str;
        };
    };

})(this);