(function(root, nano, _, $, undefined) {
    /**
     * Base column class.
     * 
     * @class    nano.ui.grid.Column
     * @author   ofca <ofca@emve.org>
     * @extends  nano.Base
     */
    nano.define('nano.ui.grid.Column', {
        /**
         * Constructor.
         * @param  {Object} o Configuration
         * @constructor
         */
        constructor: function(o) {
            o = o || {};

            _.extend(this, {
                /**
                 * @property {String} id
                 * Unique column id.
                 * @readonly
                 */
                id: _.uniqueId(),
                grid: null,
                /**
                 * @cfg {String} text Column name.
                 * @property
                 */
                text: '',
                /**
                 * @cfg {String} index Column data index.
                 * @property
                 */
                name: '',
                sortable: true,
                sortAsc: true,
                type: 'string',
                display: true,
                visible: true,
                virtual: false,
                /**
                 * @cfg {Function} sortFunction Custom function used to sort this column.
                 *
                 * Example of function sorting column by date:
                 * 
                 *     sortFunction: function(value, index, list) {
                 *         var date = value.createdAt.split('-');
                 *         date = new Date(date[0], date[1] - 1, date[2]);
                 *         return -date.getTime();
                 *     }
                 */
                sortFunction: null
            }, o);
        },
        unmarkSorted: function() {
            $('#gridHeader-'+this.id).removeClass('nano-grid-columnSorted');
            return this;
        },
        sort: function(func, asc) {
            asc = asc === undefined ? this.sortAsc : asc;

            if (this.grid.sortedBy == this.name) {
                asc = !asc;
            }

            this.grid.rendered &&
                $('#gridHeader-' + this.id)
                    .removeClass('nano-grid-columnSorted-' + (this.sortAsc ? 'asc' : 'desc'))
                    .addClass('nano-grid-columnSorted nano-grid-columnSorted-' + (asc ? 'asc' : 'desc'));
            

            this.sortAsc = asc;

            this.grid.data = 
                _.sortBy(
                    this.grid.data, 
                    func || this.sortFunction || asc 
                        ? this.name 
                        : function(value, index, list) {
                            value = value[this.name];
                            if (this.type == 'integer') {
                                return -parseInt(value);
                            } else {
                                return _.map(value.toLowerCase().split(''), function(letter) { 
                                    return String.fromCharCode(-(letter.charCodeAt(0)));
                                });
                            }
                        }, 
                    this
                );

            return this;
        },
        /**
         * Return true if column is visible for user.
         * @return {Boolean}
         */
        isVisible: function() {
            return ! ( ! this.display || ! this.visible);
        },
        renderHeaderCell: function() {
            var css = 'nano-grid-columnHeader';

            if (this.grid.sortedBy.indexOf(this.name) != -1) {
                css += ' nano-grid-columnSorted nano-grid-columnSorted-' + (this.sortAsc ? 'asc' : 'desc');
            }

            if (this.sortable) {
                css += ' nano-grid-columnSortable';
            }

            var html = '<th><div id="gridHeader-'+this.id+'" class="'+css+'"';

            html += ' data-column-name="' + this.name + '">';

            html += this.text;
            html += ' <span class="nano-grid-columnSortStatus icon-chevron-down"></span>';
            html += '<a class="nano-grid-columnSettings icon-cog pull-right"></a>';
            html +=' </div></th>';

            return html;
        },
        renderCell: function(value, data, cellIndex, rowIndex) {
            return '<td>' + value + '</td>';
        }
    });
})(this, this.nano, this._, this.jQuery, [][0]);