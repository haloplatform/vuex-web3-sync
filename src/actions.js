import Web3 from 'web3'

const sleep = (ms = 1000) => new Promise((resolve, reject) => setTimeout(resolve, ms))

export default {
  connectToWeb3: ({ commit }) =>
    new Promise((resolve, reject) => {
      window.addEventListener('load', () => {
        if (window.web3 !== undefined) {
          // Use Mist/MetaMask's provider
          const web3 = new Web3(window.web3.currentProvider)
          commit('setInjected', web3.isConnected())
          commit('setInstance', () => web3)
          commit('setLocal', false)
          resolve(web3)
        } else {
          const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
          commit('setInjected', web3.isConnected())
          commit('setInstance', () => web3)
          commit('setLocal', true)
          resolve(web3)
        }
      })
    }),
  getBlockchainNetworkId: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance().version.getNetwork((err, networkId) => {
        if (err) {
          reject(err)
        } else {
          commit('setNetworkId', networkId)
          resolve(networkId)
        }
      })
    }),
  getCoinbase: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance().eth.getCoinbase((err, coinbase) => {
        if (err) {
          reject(err)
        } else {
          commit('setCoinbase', coinbase)
          resolve(coinbase)
        }
      })
    }),
  getBalance: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      const coinbase = state.web3.instance().eth.coinbase
      if (!coinbase) {
        return resolve('0')
      }
      state.web3.instance().eth.getBalance(state.web3.instance().eth.coinbase, (err, result) => {
        if (err) {
          reject(err)
        } else {
          const balance = state.web3.instance().fromWei(result.toString(10), 'ether')
          commit('setBalance', balance)
          resolve(balance)
        }
      })
    }),
  async monitorWeb3({ state, dispatch }) {
    if (state.web3.isLocal || !state.web3.instance()) {
      return
    }
    while (true) {
      await sleep(1000)
      // check for networkId change
      const oldNetworkId = state.web3.networkId
      if (oldNetworkId !== (await dispatch('getBlockchainNetworkId'))) {
        return window.location.reload()
      }
      // refresh coinbase
      await dispatch('getCoinbase')
      await dispatch('getBalance')
    }
  },
  async init({ dispatch, commit, state }) {
    await dispatch('connectToWeb3')
    await dispatch('getBlockchainNetworkId')
    await dispatch('getCoinbase')
    await dispatch('getBalance')
    commit('setAddress', state.web3.instance().eth.defaultAccount)
    dispatch('monitorWeb3')
  },
}
