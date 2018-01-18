'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Web3 = _interopDefault(require('web3'));

var state = {
  web3: {
    address: null,
    coinbase: null,
    instance: null,
    isInjected: false,
    networkId: null,
    isLocal: false,
  },
}

const APPROVED_NETWORK_ID = '5777';

var getters = {
  address: state => state.web3.address,
  coinbase: state => state.web3.coinbase,
  instance: state => state.web3.instance,
  isInjected: state => state.web3.isInjected,
  networkId: state => state.web3.networkId,
  isLocal: state => state.web3.isLocal,
  isApprovedNetwork: state =>
    state.web3.networkId && state.web3.networkId !== '' && state.web3.networkId === APPROVED_NETWORK_ID,
}

var mutations = {
  setInjected(state, payload) {
    state.web3.isInjected = payload;
  },
  setInstance(state, payload) {
    state.web3.instance = payload;
  },
  setLocal(state, payload) {
    state.web3.isLocal = payload;
  },
  setNetworkId(state, payload) {
    state.web3.networkId = payload;
  },
  setCoinbase(state, payload) {
    state.web3.coinbase = payload;
  },
  setAddress(state, payload) {
    state.web3.address = payload;
  },
}

const sleep = (ms = 1000) => new Promise((resolve, reject) => setTimeout(resolve, ms));

var actions = {
  connectToWeb3: ({ commit }) =>
    new Promise((resolve, reject) => {
      window.addEventListener('load', () => {
        if (window.web3 !== undefined) {
          // Use Mist/MetaMask's provider
          const web3 = new Web3(window.web3.currentProvider);
          commit('setInjected', web3.isConnected());
          commit('setInstance', web3);
          commit('setLocal', false);
          resolve(web3);
        } else {
          const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
          commit('setInjected', web3.isConnected());
          commit('setInstance', web3);
          commit('setLocal', true);
          resolve(web3);
        }
      });
    }),
  getBlockchainNetworkId: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance.version.getNetwork((err, networkId) => {
        if (err) {
          reject(err);
        } else {
          commit('setNetworkId', networkId);
          resolve(networkId);
        }
      });
    }),
  getCoinbase: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance.eth.getCoinbase((err, coinbase) => {
        if (err) {
          reject(err);
        } else {
          commit('setCoinbase', coinbase);
          resolve(coinbase);
        }
      });
    }),
  async monitorWeb3({ state, dispatch }) {
    if (state.web3.isLocal || !state.web3.instance) {
      return
    }
    while (true) {
      await sleep(1000);
      // check for networkId change
      const oldNetworkId = state.web3.networkId;
      if (oldNetworkId !== (await dispatch('getBlockchainNetworkId'))) {
        return window.location.reload()
      }
      // refresh coinbase
      await dispatch('getCoinbase');
    }
  },
  async init({ dispatch, commit, state }) {
    await dispatch('connectToWeb3');
    await dispatch('getBlockchainNetworkId');
    await dispatch('getCoinbase');
    commit('setAddress', state.web3.instance.eth.defaultAccount);
    dispatch('monitorWeb3');
  },
}

var index = (store, moduleName = 'WebThree') => {
  store.registerModule(moduleName, {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
  });
  store.dispatch('init');
}

module.exports = index;
