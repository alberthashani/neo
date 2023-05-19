import CheckBox from './CheckBox.mjs';

/**
 * @class Neo.form.field.Switch
 * @extends Neo.form.field.CheckBox
 */
class Switch extends CheckBox {
    static config = {
        /**
         * @member {String} className='Neo.form.field.Switch'
         * @protected
         */
        className: 'Neo.form.field.Switch',
        /**
         * @member {String} ntype='switchfield'
         * @protected
         */
        ntype: 'switchfield',
        /**
         * @member {String[]} baseCls=['neo-checkboxfield']
         */
        baseCls: ['neo-switchfield'],
        /**
         * @member {Object} _vdom
         */
        _vdom:
            {cn: [
                {tag: 'label', cls: ['neo-checkbox-label'], cn: [
                    {tag: 'span', cls: []},
                    {tag: 'input', cls: ['neo-checkbox-input']},
                    {tag: 'i', cls: ['neo-checkbox-icon'], removeDom: true},
                    {tag: 'span', cls: ['neo-checkbox-value-label']}
                ]},
                {cls: ['neo-error-wrapper'], removeDom: true, cn: [
                    {cls: ['neo-error']}
                ]}
            ]}
    }
}

Neo.applyClassConfig(Switch);

export default Switch;
