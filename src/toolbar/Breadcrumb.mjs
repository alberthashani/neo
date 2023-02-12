import ClassSystemUtil from '../util/ClassSystem.mjs';
import Store           from '../data/Store.mjs';
import Toolbar         from '../toolbar/Base.mjs';

/**
 * @class Neo.toolbar.Breadcrumb
 * @extends Neo.toolbar.Base
 */
class Breadcrumb extends Toolbar {
    static config = {
        /**
         * @member {String} className='Neo.toolbar.Breadcrumb'
         * @protected
         */
        className: 'Neo.toolbar.Breadcrumb',
        /**
         * @member {String} ntype='breadcrumb-toolbar'
         * @protected
         */
        ntype: 'breadcrumb-toolbar',
        /**
         * @member {String[]} baseCls=['neo-breadcrumb-toolbar','neo-toolbar']
         */
        baseCls: ['neo-breadcrumb-toolbar', 'neo-toolbar'],
        /**
         * @member {Number|String|null} activeKey_=null
         */
        activeKey_: null,
        /**
         * @member {Object[]} items
         */
        items: [],
        /**
         * @member {Neo.data.Store|Object} store_=null
         */
        store_: null
    }

    /**
     * @member {Object} defaultStoreConfig
     */
    defaultStoreConfig = {
        module: Store,

        model: {
            fields: [{
                name: 'id',
                type: 'Integer'
            }, {
                name: 'name',
                type: 'String'
            }, {
                name: 'parentId',
                type: 'Integer'
            }, {
                name: 'route',
                type: 'String'
            }]
        }
    }

    /**
     * Triggered after the activeKey config got changed
     * @param {Number|String|null} value
     * @param {Number|String|null} oldValue
     * @protected
     */
    afterSetActiveKey(value, oldValue) {
        this.store.getCount?.() > 0 && this.updateItems()
    }

    /**
     * Triggered after the store config got changed
     * @param {Neo.data.Store|Object} value
     * @param {Neo.data.Store|Object} oldValue
     * @protected
     */
    afterSetStore(value, oldValue) {
        let me = this;

        value.on({
            load: this.onStoreLoad,
            scope: me
        });

        value?.getCount() > 0 && me.onStoreLoad(value.items)
    }

    /**
     * Triggered before the store config gets changed
     * @param {Neo.data.Store|Object} value
     * @param {Neo.data.Store|Object} oldValue
     * @returns {Neo.data.Store}
     * @protected
     */
    beforeSetStore(value, oldValue) {
        oldValue?.destroy();
        return ClassSystemUtil.beforeSetInstance(value, null, this.defaultStoreConfig);
    }

    /**
     * @returns {Object[]}
     */
    getPathItems() {
        let items    = [],
            parentId = this.activeKey,
            store    = this.store,
            item;

        while (parentId !== null) {
            item = store.get(parentId);

            items.unshift(item);

            parentId = item.parentId;
        }

        return items;
    }

    /**
     * @param {Object[]} items
     */
    onStoreLoad(items) {
        this.activeKey !== null && this.updateItems()
    }

    /**
     *
     */
    updateItems() {
        let me        = this,
            items     = me.items,
            pathItems = me.getPathItems(),
            i         = 0,
            len       = pathItems.length,
            newItems  = [],
            config, item

        me.silentVdomUpdate = true;

        for (; i < len; i++) {
            item = pathItems[i];

            config = {
                editRoute: false,
                hidden   : false,
                route    : item.route,
                text     : item.name
            };

            if (items[i]) {
                items[i].setSilent(config);
            } else {
                newItems.push(config);
            }
        }

        len = items.length;

        for (; i < len; i++) {
            item = items[i];

            item.silentVdomUpdate = true;
            item.hidden           = true;
            item.silentVdomUpdate = false;
        }

        newItems.length > 0 && me.add(newItems);

        me.silentVdomUpdate = false;

        me.update();
    }
}

Neo.applyClassConfig(Breadcrumb);

export default Breadcrumb;
