'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Web3 = _interopDefault(require('web3'));

var state = {
  web3: {
    address: null,
    coinbase: null,
    instance: function instance() {
      return null;
    },
    isInjected: false,
    networkId: null,
    isLocal: false,
    balance: null
  }
};

var APPROVED_NETWORK_ID = '5777';

var getters = {
  address: function address(state) {
    return state.web3.address;
  },
  coinbase: function coinbase(state) {
    return state.web3.coinbase;
  },
  instance: function instance(state) {
    return state.web3.instance;
  },
  isInjected: function isInjected(state) {
    return state.web3.isInjected;
  },
  networkId: function networkId(state) {
    return state.web3.networkId;
  },
  isLocal: function isLocal(state) {
    return state.web3.isLocal;
  },
  balance: function balance(state) {
    return state.web3.balance;
  },
  isApprovedNetwork: function isApprovedNetwork(state) {
    return state.web3.networkId && state.web3.networkId !== '' && state.web3.networkId === APPROVED_NETWORK_ID;
  }
};

var mutations = {
  setInjected: function setInjected(state, payload) {
    state.web3.isInjected = payload;
  },
  setInstance: function setInstance(state, payload) {
    state.web3.instance = payload;
  },
  setLocal: function setLocal(state, payload) {
    state.web3.isLocal = payload;
  },
  setNetworkId: function setNetworkId(state, payload) {
    state.web3.networkId = payload;
  },
  setCoinbase: function setCoinbase(state, payload) {
    state.web3.coinbase = payload;
  },
  setAddress: function setAddress(state, payload) {
    state.web3.address = payload;
  },
  setBalance: function setBalance(state, payload) {
    state.web3.balance = payload;
  }
};

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var sleep = function sleep() {
  var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
  return new Promise(function (resolve, reject) {
    return setTimeout(resolve, ms);
  });
};

var actions = {
  connectToWeb3: function connectToWeb3(_ref) {
    var commit = _ref.commit;
    return new Promise(function (resolve, reject) {
      window.addEventListener('load', function () {
        if (window.web3 !== undefined) {
          // Use Mist/MetaMask's provider
          var web3 = new Web3(window.web3.currentProvider);
          commit('setInjected', web3.isConnected());
          commit('setInstance', function () {
            return web3;
          });
          commit('setLocal', false);
          resolve(web3);
        } else {
          var _web = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
          commit('setInjected', _web.isConnected());
          commit('setInstance', function () {
            return _web;
          });
          commit('setLocal', true);
          resolve(_web);
        }
      });
    });
  },
  getBlockchainNetworkId: function getBlockchainNetworkId(_ref2) {
    var commit = _ref2.commit,
        state = _ref2.state;
    return new Promise(function (resolve, reject) {
      state.web3.instance().version.getNetwork(function (err, networkId) {
        if (err) {
          reject(err);
        } else {
          commit('setNetworkId', networkId);
          resolve(networkId);
        }
      });
    });
  },
  getCoinbase: function getCoinbase(_ref3) {
    var commit = _ref3.commit,
        state = _ref3.state;
    return new Promise(function (resolve, reject) {
      state.web3.instance().eth.getCoinbase(function (err, coinbase) {
        if (err) {
          reject(err);
        } else {
          commit('setCoinbase', coinbase);
          resolve(coinbase);
        }
      });
    });
  },
  getBalance: function getBalance(_ref4) {
    var commit = _ref4.commit,
        state = _ref4.state;
    return new Promise(function (resolve, reject) {
      state.web3.instance().eth.getBalance(state.web3.instance().eth.coinbase, function (err, result) {
        if (err) {
          reject(err);
        } else {
          var balance = state.web3.instance().fromWei(result.toString(10), 'ether');
          commit('setBalance', balance);
          resolve(balance);
        }
      });
    });
  },
  monitorWeb3: function () {
    var _ref6 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref5) {
      var state = _ref5.state,
          dispatch = _ref5.dispatch;
      var oldNetworkId;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(state.web3.isLocal || !state.web3.instance())) {
                _context.next = 2;
                break;
              }

              return _context.abrupt('return');

            case 2:
              

              _context.next = 5;
              return sleep(1000);

            case 5:
              // check for networkId change
              oldNetworkId = state.web3.networkId;
              _context.t0 = oldNetworkId;
              _context.next = 9;
              return dispatch('getBlockchainNetworkId');

            case 9:
              _context.t1 = _context.sent;

              if (!(_context.t0 !== _context.t1)) {
                _context.next = 12;
                break;
              }

              return _context.abrupt('return', window.location.reload());

            case 12:
              _context.next = 14;
              return dispatch('getCoinbase');

            case 14:
              _context.next = 16;
              return dispatch('getBalance');

            case 16:
              _context.next = 2;
              break;

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function monitorWeb3(_x2) {
      return _ref6.apply(this, arguments);
    }

    return monitorWeb3;
  }(),
  init: function () {
    var _ref8 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref7) {
      var dispatch = _ref7.dispatch,
          commit = _ref7.commit,
          state = _ref7.state;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return dispatch('connectToWeb3');

            case 2:
              _context2.next = 4;
              return dispatch('getBlockchainNetworkId');

            case 4:
              _context2.next = 6;
              return dispatch('getCoinbase');

            case 6:
              _context2.next = 8;
              return dispatch('getBalance');

            case 8:
              commit('setAddress', state.web3.instance().eth.defaultAccount);
              dispatch('monitorWeb3');

            case 10:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function init(_x3) {
      return _ref8.apply(this, arguments);
    }

    return init;
  }()
};

var index = (function (store) {
  var moduleName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'WebThree';

  store.registerModule(moduleName, {
    namespaced: true,
    state: state,
    getters: getters,
    mutations: mutations,
    actions: actions
  });
  store.dispatch(moduleName + '/init');
});

module.exports = index;
