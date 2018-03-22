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
          if (state.web3.address) {
            commit('setCoinbase', state.web3.address)
            resolve(state.web3.address)
          }
          reject(err)
        } else {
          if (state.coinbase !== coinbase) commit('setCoinbase', coinbase || state.web3.address)
          resolve(coinbase)
        }
      })
    }),
  getBalance: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      const coinbase = state.web3.instance().eth.defaultAccount
      if (!coinbase) {
        return resolve('0')
      }
      state.web3.instance().eth.getBalance(state.web3.instance().eth.defaultAccount, (err, result) => {
        if (err) {
          reject(err)
        } else {
          const balance = state.web3.instance().fromWei(result.toString(10), 'ether')
          if (state.balance !== balance) commit('setBalance', balance)
          resolve(balance)
        }
      })
    }),
  checkUnlock: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance().eth.sign(state.web3.address, "")
        .then((data) => {
          commit('setUnlock', true)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    }),
  async monitorWeb3({ state, dispatch, commit }) {
    // if (state.web3.isLocal || !state.web3.instance()) {
    //   return
    // }
    while (true) {
      await sleep(1000)
      // check for networkId change
      const oldNetworkId = state.web3.networkId
      if (oldNetworkId !== (await dispatch('getBlockchainNetworkId'))) {
        return window.location.reload()
      }
      // refresh coinbase
      const eth = state.web3.instance().eth
      if (!eth.defaultAccount && eth.accounts && eth.accounts.length) {
        eth.defaultAccount = eth.accounts[0]
      }
      commit('setAddress', eth.defaultAccount)
      // commit('setCoinbase', eth.defaultAccount)
      try {
        await dispatch('getCoinbase')
      } catch (err) {
        console.log('get coinbase error:', err)
      }
      try {
        await dispatch('getBalance')
      } catch (err) {
        console.log('get balance error:', err)
      }
      try {
        await dispatch('checkUnlock')
      } catch (err) {
        commit('setUnlock', false)
        console.log(err)
      }
    }
  },
  async init({ dispatch, commit, state }) {
    await dispatch('connectToWeb3')
    await dispatch('getBlockchainNetworkId')
    const eth = state.web3.instance().eth
    if (!eth.defaultAccount && eth.accounts && eth.accounts.length) {
      eth.defaultAccount = eth.accounts[0]
    }
    commit('setAddress', eth.defaultAccount)
    try {
      await dispatch('getCoinbase')
    } catch (err) {
      console.log('get coinbase error:', err)
    }
    try {
      await dispatch('getBalance')
    } catch (err) {
      console.log('get balance error:', err)
    }
    try {
      await dispatch('checkUnlock')
    } catch (err) {
      commit('setUnlock', false)
    }
    dispatch('monitorWeb3')
  },
}
