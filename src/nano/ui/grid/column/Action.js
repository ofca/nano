(function(nano, _) {

    "use strict"
    
    /**
     * Column provide functionality for grid row menus.
     *
     * @class    nano.ui.grid.column.Action
     * @author   ofca <ofca@emve.org>
     * @extends  nano.ui.grid.Column
     */
    nano.define('nano.ui.grid.column.Action', {        
        $extend: 'nano.ui.grid.Column',
        constructor: function(o) {
            var items = this.items = [];

            if (o.items) {
                items = o.items;
                delete o.items;
            }

            this.$super.prototype.constructor.call(this, o);

            this.addItems(items);
        },
        addItems: function(o) {
            _.map(o, this.addItem, this);
        },
        addItem: function(o) {
            var me = this;

            o = _.defaults(o, {
                icon: null,
                tooltip: '',
                handler: function() {},
                id: _.uniqueId()
            });

            this.items.push(o);

            this.grid.addAction('.cell-action-'+o.id+':click', function(el, e) {
                o.handler.call(me.grid, el, parseInt(el.parentNode.getAttribute('data-rowindex')), e);
            });
        },
        renderCell: function(val, data, columnIndex, rowIndex) {
            var html = '<td class="action" data-rowindex="'+rowIndex+'">';

            if (this.items.length) {
                var i = 0, 
                    items = this.items, 
                    len = items.length, item;

                for (; i < len; i++) {
                    item = items[i];
                    html += '<a class="btn btn-small cell-action-'+item.id+'">';

                    if (item.icon) {
                        html += '<i class="icon-minus-sign"></i>';
                    }

                    html += '</a>';
                }
            }

            html += '</td>';

            return html;
        }
    });

})(this.nano, this._);