import Base             from './Base.mjs';
import ComponentManager from '../manager/Component.mjs';
import DomEventManager  from '../manager/DomEvent.mjs';
import Logger           from '../util/Logger.mjs';

/**
 * @class Neo.controller.Component
 * @extends Neo.controller.Base
 */
class Component extends Base {
    static config = {
        /**
         * @member {String} className='Neo.controller.Component'
         * @protected
         */
        className: 'Neo.controller.Component',
        /**
         * @member {String} ntype='component-controller'
         * @protected
         */
        ntype: 'component-controller',
        /**
         * @member {Neo.component.Base|null} component=null
         * @protected
         */
        component: null,
        /**
         * @member {Neo.controller.Component|null} parent_=null
         */
        parent_: null,
        /**
         * @member {Object} references=null
         * @protected
         */
        references: null
    }

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);

        let me        = this,
            component = me.component,
            listenerId;

        me.references = {};

        if (component.isConstructed) {
            me.onComponentConstructed();
        } else {
            listenerId = component.on('constructed', () => {
                component.un('constructed', listenerId);
                me.onComponentConstructed();
            });
        }
    }

    /**
     * Triggered before the parent config gets changed
     * @param {Neo.controller.Component|null} value
     * @param {Neo.controller.Component|null} oldValue
     * @protected
     */
    beforeSetParent(value, oldValue) {
        return value ? value : this.getParent();
    }

    /**
     * @param {String} handlerName
     * @returns {Neo.controller.Component|null}
     */
    getHandlerScope(handlerName) {
        let me     = this,
            parent = me.parent;

        return Neo.isFunction(me[handlerName]) ?
            me : parent ?
            parent.getHandlerScope(handlerName) : null;
    }

    /**
     * sameLevelOnly=false will return the closest VM inside the component parent tree,
     * in case there is none on the same level.
     * @param {Boolean} [sameLevelOnly=false]
     */
    getModel(sameLevelOnly=false) {
        let component = this.component;
        return sameLevelOnly ? component.model : component.getModel();
    }

    /**
     * Get the closest controller inside the components parent tree
     * @returns {Neo.controller.Component|null}
     */
    getParent() {
        let me = this,
            parentComponent, parentId;

        if (me.parent) {
            return me.parent;
        }

        parentId        = me.component.parentId;
        parentComponent = parentId && Neo.getComponent(parentId);

        return parentComponent?.getController() || null;
    }

    /**
     * todo: update changed references (e.g. container.remove() then container.add() using the same key)
     * @param {String} name
     * @returns {*}
     */
    getReference(name) {
        let me        = this,
            component = me.references[name];

        if (!component) {
            component = me.component.down({reference: name});

            if (component) {
                me.references[name] = component;
            }
        }

        return component || null;
    }

    /**
     * Override this method inside your view controllers as a starting point in case you need references
     * (instead of using onConstructed() inside your controller)
     */
    onComponentConstructed() {}

    /**
     * @param {Neo.component.Base} component=this.component
     */
    parseConfig(component=this.component) {
        let me        = this,
            listeners = component.listeners,
            reference = component.reference,
            validator = component.validator,
            eventHandler, handlerScope;

        if (listeners) {
            Object.entries(listeners).forEach(([key, value]) => {
                if (key !== 'scope' && key !== 'delegate') {
                    if (Neo.isString(value)) {
                        eventHandler = value;
                        handlerScope = me.getHandlerScope(eventHandler);

                        if (!handlerScope) {
                            Logger.logError('Unknown event handler for', eventHandler, component);
                        } else {
                            listeners[key] = {};
                            listeners[key].fn = handlerScope[eventHandler].bind(handlerScope);
                        }
                    } else {
                        value.forEach(listener => {
                            if (Neo.isObject(listener) && listener.hasOwnProperty('fn') && Neo.isString(listener.fn)) {
                                eventHandler = listener.fn;
                                handlerScope = me.getHandlerScope(eventHandler);

                                if (!handlerScope) {
                                    Logger.logError('Unknown event handler for', eventHandler, component);
                                } else {
                                    listener.fn = handlerScope[eventHandler].bind(handlerScope);
                                }
                            }
                        });
                    }
                }
            });
        }

        if (Neo.isString(validator)) {
            handlerScope = me.getHandlerScope(validator);

            if (!handlerScope) {
                Logger.logError('Unknown validator for', component.id, component);
            } else {
                component.validator = handlerScope[validator].bind(handlerScope);
            }
        }

        if (reference) {
            me.references[reference] = component;
        }
    }

    /**
     * @param {Neo.component.Base} component=this.component
     */
    parseDomListeners(component=this.component) {
        let me           = this,
            domListeners = component.domListeners,
            eventHandler, scope;

        if (domListeners) {
            domListeners.forEach(domListener => {
                Object.entries(domListener).forEach(([key, value]) => {
                    eventHandler = null;

                    if (key !== 'scope' && key !== 'delegate') {
                        if (Neo.isString(value)) {
                            eventHandler = value;
                        } else if (Neo.isObject(value) && value.hasOwnProperty('fn') && Neo.isString(value.fn)) {
                            eventHandler = value.fn;
                        }

                        if (eventHandler) {
                            scope = me.getHandlerScope(eventHandler);

                            if (!scope) {
                                Logger.logError('Unknown domEvent handler for', eventHandler, component);
                            } else {
                                domListener[key] = scope[eventHandler].bind(scope);
                            }
                        }
                    }
                });
            });
        }
    }

    /**
     * Will get called by component.Base: destroy() in case the component has a reference config
     * @param {Neo.component.Base} component
     */
    removeReference(component) {
        let me = this,
            references = me.references,
            key;

        for (key in references) {
            if (component === references[key]) {
                delete references[key];
                break;
            }
        }

        me.getParent()?.removeReference(component);
    }
}

Neo.applyClassConfig(Component);

export default Component;
