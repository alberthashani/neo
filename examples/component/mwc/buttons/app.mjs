import MainContainer from './MainContainer.mjs';

const onStart = () => Neo.app({
    mainView: MainContainer,
    name    : 'Neo.examples.component.mwc.buttons'
});

export {onStart as onStart};