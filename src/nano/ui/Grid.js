(function(root, nano, _, $) {

    "use strict"

    /**
     * Grid component.
     *
     * @class    nano.ui.Grid
     * @extends  nano.Base
     * @author   ofca <ofca@emve.org>
     * @uses     nano.ui.grid.Column
     * @uses     nano.ui.grid.column.String
     */
    nano.define('nano.ui.Grid', {
        $uses: [
            'nano.ui.grid.Column',
            'nano.ui.grid.column.String'
        ],
        $configs: [
            /**
             * @cfg {HTMLElement/String} appendTo
             * DOMElement to render grid.
             */
            '!appendTo',
            /**                 
             * @cfg {Array} columns 
             * Grid columns definition.
             */
            '!columns',
            /**
             * @cfg {String} template
             * Grid html template.
             */
            'template', 
            /**
             * @cfg {Boolean} sortLocal
             * Flag indicating whether sorting should be done
             * in browser or on the server.
             * If loader is defined default value is false,
             * otherwise true.
             *
             * If sortLocal is false then to loading data
             * request are attached two variables:
             * 
             * *  sortby=columnName
             * *  sorttype=asc-or-desc
             */
            'sortLocal',
            /**
             * @cfg {Function/String} loader Function which will load data.
             */
            'loader',
            /**
             * @cfg {Array} data
             * Data to display.
             */
            'data',
            /**
             * @cfg {Array} css
             * Css classes applied to table dom element.
             */
            'css',
            /**
             * @cfg {String} sortBy 
             * Name of the column to sort by.
             */
            'sortBy'
        ],
        $properties: function() {
            return {
                /**
                 * @property {String} template
                 * Grid html template. Call render after changing value of this property.
                 */
                template: '<table class="{{css}}"></table>',
                /**                 
                 * @property {Array} columns 
                 * Grid columns definition.
                 * @readonly
                 */
                columns: [],
                /**
                 * @property {Array} data
                 * Data to display.
                 * @readonly
                 */
                data: [],
                /**
                 * @property {HTMLElement/String} appendTo
                 * DOMElement to render grid.
                 */
                appendTo: null,
                /**
                 * @property {Array} css
                 * Css classes applied to table dom element.
                 */
                css: ['table'],
                /**
                 * @property {Boolean} localData
                 * If false, data is loaded async.
                 * @readonly
                 */
                localData: true,
                /**
                 * @property {Boolean} sortLocal
                 * Flag indicating whether sorting should be done
                 * in browser or on the server.
                 * If loader is defined default value is false,
                 * otherwise true.
                 *
                 * If sortLocal is false then to loading data
                 * request are attached two variables:
                 * 
                 * *  sortby=columnName
                 * *  sorttype=asc-or-desc
                 */
                sortLocal: false,
                /**
                 * @property {Function/String} loader
                 * Function which will load data.
                 * @readonly
                 */
                loader: null,
                /**
                 * @property {Object} dom 
                 * Handles link to HTMLElements.
                 * @property {Object} dom.table Handler to table HTMLElement. Available after nano.ui.Grid.render() executed.
                 * @readonly
                 */
                dom: {},
                /**
                 * @property {String} sortedBy
                 * Name of the column by which grid is sorted.
                 * @readonly
                 */
                sortedBy: null,
                /**
                 * @property {Boolean} rendered True if grid is rendered.
                 * @readonly
                 */
                rendered: false
            }
        },
        /**
         * Constructor.
         *
         *     @example
         *     var grid = new nano.ui.Grid({
         *         appendTo: 'grid'
         *     });
         * 
         * @param  {Object} o Configuration.
         * @constructor
         */
        constructor: function(o) {
            this.$super.prototype.constructor.call(this, o);

            if (o.sortBy) {
                this.sortBy(sortBy);
            }
        },
        setLoader: function(o) {
            var me = this;

            if (_.isFunction(o)) {
                this.loader = o;
            } else if (_.isString(o)) {
                nano.ajax({
                    url: o,
                    method: 'get',
                    dataType: 'json',
                    complete: function(data) {
                        me.data = data;
                        me.renderRows();
                    }
                });
            }

            return this;
        },
        addActions: function(o) {
            _.map(o, function(v, k) { this.addAction(k, v); }, this); 
        },
        addAction: function(path, handler) {
            path = path.split(':');

            var me = this, 
                action = path[1],
                selectors = path[0];

            $(this.renderTo).on(action, selectors, function(e) {
                handler.call(me, this, e);
            });
        },
        setRenderTo: function(value) {
            if (typeof value == 'string') {
                value = document.getElementById(value);
            }

            if ( ! value) {
                throw new Error('nano.ui.Grid: Specified dom element does not exists.');
            }

            this.renderTo = value;
        },
        setColumn: function(o) {
            var type = o.type || 'string';
    
            // Capitalize first char
            type = type.charAt(0).toUpperCase() + type.slice(1);

            o.grid = this;

            var column = nano.create('nano.ui.grid.column.'+type, o);

            this.columns.push(column);

            // Sorting is not set yet
            if ( ! this.sortedBy && column.sortable) {
                this.sortedBy = column.name;
            }
        },
        setColumns: function(columns) {
            var i = 0, len = columns.length;

            for (; i < len; i++) {
                this.setColumn(columns[i]);
            }
        },
        render: function() {
            this.renderTo.innerHTML = nano.tmpl(this.template, {
                css: this.css.join(' ')
            });

            this.dom.table = this.renderTo.getElementsByTagName('table')[0];
            this.renderHeaders();
            this.renderRows();

            this.rendered = true;
        },
        renderHeaders: function() {
            var html = [],
                cols = this.columns,
                len = cols.length, i = 0, col,
                table = this.dom.table, thead, el;

            for (; i < len; i++) {
                col = cols[i];

                if ( ! col.isVisible()) {
                    continue;
                }

                html[i] = col.renderHeaderCell();
            }

            el = document.createElement('thead');
            el.innerHTML = '<tr>' + html.join('') + '</tr>';

            thead = table.getElementsByTagName('thead')[0];

            // thead exists, replace it
            if (thead) {
                table.replaceChild(el, thead);
            } else {
                // Insert as first child in any other 
                // node exists in the table
                table.firstChild 
                    ? table.insertBefore(el, table.firstChild)
                    : table.appendChild(el);
            }

            this.addAction('.nano-grid-columnHeader:click', function(el, e) {
                var name = el.getAttribute('data-column-name');
                this.sortBy(name);
            });
        },
        renderRows: function() {
            var me = this,
                data = me.data,
                len = data.length,
                i = 0,
                html = [], 
                table = this.dom.table,
                tbody, thead, el;

            for (; i < len; i++) {
                html[i] = me.renderRow(data[i], i);
            }

            // Create dom element
            el = document.createElement('tbody');
            el.innerHTML = html.join('');

            // Get tbody
            tbody = table.getElementsByTagName('tbody')[0];

            // If exists replace with new one
            if (tbody) {
                table.replaceChild(el, tbody);
            } else {
                thead = table.getElementsByTagName('thead')[0];

                // If thead exists insert after it
                if (thead) {
                    table.insertBefore(el, thead.nextSibling);
                } else {
                    // Insert as first child in any other 
                    // node exists in the table
                    table.firstChild
                        ? table.insertBefore(el, table.firstChild)
                        : table.appendChild(el)
                }
            }
        },
        renderRow: function(data, rowIndex) {
            var html = [], 
                cols = this.columns, 
                i = 0, 
                len = cols.length, col;

            for (; i < len; i++) {
                col = cols[i];

                if ( ! col.isVisible()) {
                    continue;
                }

                html[i] = col.renderCell(col.virtual ? null : data[col.name], data, i, rowIndex);
            }

            return '<tr>' + html.join('') + '</tr>';
        },
        getColumnBy: function(key, value) {
            var i = 0, list = this.columns, len = list.length;

            for (; i < len; i++) {
                if (list[i][key] == value) return list[i];
            }

            return false;
        },
        /**
         * Sort grid by column.
         * 
         * @param  {String} column Column index.
         * @param  {Function} func Optional. Sorting function.
         * @return {nano.ui.Grid} this
         * @chainable
         * @method
         */
        sortBy: function(column, func, asc) {            
            var column = this.getColumnBy('name', column);

            if ( ! column) { return; }

            if (column.name != this.sortedBy) {
                this.getColumnBy('name', this.sortedBy).unmarkSorted();
            }

            column.sort(func, asc);
            
            this.sortedBy = column.name;

            this.rendered && this.renderRows();

            return this;
        }
    });

})(this, this.nano, this._, this.jQuery);