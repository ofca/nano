(function(root, nano) {

    nano.namespace('nano.string', {
        ucfirst: function(str) {
            // http://kevin.vanzonneveld.net
            // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Onno Marsman
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // *     example 1: ucfirst('kevin van zonneveld');
            // *     returns 1: 'Kevin van zonneveld'
            str += '';
            return str.charAt(0).toUpperCase() + str.substr(1);
        }
    });

})(this, this.nano);