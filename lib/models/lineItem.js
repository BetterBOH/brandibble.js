'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.find');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.filter');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.map');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.compact');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.sortby');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.reverse');

var _lodash12 = _interopRequireDefault(_lodash11);

var _lodash13 = require('lodash.reduce');

var _lodash14 = _interopRequireDefault(_lodash13);

var _validate = require('validate.js');

var _validate2 = _interopRequireDefault(_validate);

var _validations = require('./validations');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OptionOperations = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
};

var OptionStatus = {
  ABSENT: 'ABSENT',
  PRESENT: 'PRESENT'
};

var LineItem = function () {
  function LineItem(product) {
    var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var uuid = arguments[2];
    (0, _classCallCheck3.default)(this, LineItem);

    var result = (0, _validate2.default)(product, _validations.productValidations);
    if (result) throw result;

    /* Allow uuid incase we want to rehyrate this lineItem. */
    this.uuid = uuid || (0, _utils.generateUUID)(product.name);
    this.product = product;
    this.quantity = quantity;
    this.configuration = [];
    this.madeFor = '';
    this.instructions = '';
    this.operationMaps = [];

    if (!uuid) this._applyDefaultConfiguration();
    this._generateOperationMaps();
  }

  (0, _createClass3.default)(LineItem, [{
    key: 'configurationForGroup',
    value: function configurationForGroup(groupOrId) {
      var optionGroupId = (typeof groupOrId === 'undefined' ? 'undefined' : (0, _typeof3.default)(groupOrId)) === 'object' ? groupOrId.id : parseInt(groupOrId);
      return (0, _lodash2.default)(this.configuration, { optionGroupId: optionGroupId });
    }
  }, {
    key: 'addOption',
    value: function addOption(group, item) {
      var groupConfig = this.configurationForGroup(group);
      var canAdd = group.max_options === 0 || group.max_options > (groupConfig ? groupConfig.optionItems.length : 0);

      if (!canAdd) {
        var error = {
          error: 'Can not add another option for this group.',
          type: 'option_group',
          subject: group,
          relatedConfiguration: groupConfig
        };
        throw error;
      }

      var match = (0, _lodash2.default)(this.configuration, { optionGroupId: group.id });
      if (match) {
        match.optionItems.push(item);
      } else {
        this.configuration.push({
          optionGroupId: group.id,
          optionItems: [item]
        });
      }
      this._generateOperationMaps();
      return true;
    }
  }, {
    key: 'removeOption',
    value: function removeOption(item) {
      var match = (0, _lodash2.default)(this.configuration, { optionGroupId: item.group_id });
      var firstMatchingOptionItem = (0, _lodash2.default)(match.optionItems, function (oi) {
        return oi.id === item.id;
      });
      if (!firstMatchingOptionItem) return false;
      match.optionItems.splice(match.optionItems.indexOf(firstMatchingOptionItem), 1);
      this._generateOperationMaps();
      return true;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return this.errors().length === 0;
    }
  }, {
    key: 'hasOptionGroups',
    value: function hasOptionGroups() {
      return this.optionGroups().length > 0;
    }
  }, {
    key: 'optionGroups',
    value: function optionGroups() {
      return this.product.option_groups || [];
    }
  }, {
    key: 'errors',
    value: function errors() {
      var _this = this;

      var optionGroups = this.product.option_groups || [];
      return (0, _lodash8.default)((0, _lodash6.default)(optionGroups, function (group) {
        var match = (0, _lodash2.default)(_this.configuration, { optionGroupId: group.id });
        var count = match ? match.optionItems.length : 0;
        if (count < group.min_options) {
          return {
            error: 'Too Few Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: _this.configurationForGroup(group)
          };
        }
        if (group.max_options !== 0 && count > group.max_options) {
          return {
            error: 'Too Many Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: _this.configurationForGroup(group)
          };
        }
      }));
    }
  }, {
    key: 'format',
    value: function format() {
      var mapItems = function mapItems(_ref) {
        var id = _ref.id;
        return { id: id };
      };
      var mapGroup = function mapGroup(group) {
        return {
          id: group.optionGroupId,
          option_items: (0, _lodash6.default)(group.optionItems, mapItems)
        };
      };
      var option_groups = (0, _lodash6.default)(this.configuration, mapGroup);

      return {
        id: this.product.id,
        made_for: this.madeFor,
        instructions: this.instructions,
        quantity: this.quantity,
        option_groups: option_groups
      };
    }
  }, {
    key: 'formatForFavorites',
    value: function formatForFavorites() {
      var mapItems = function mapItems(_ref2) {
        var id = _ref2.id;
        return { id: id };
      };
      var mapGroup = function mapGroup(group) {
        return {
          id: group.optionGroupId,
          option_items: (0, _lodash6.default)(group.optionItems, mapItems)
        };
      };
      var option_groups = (0, _lodash6.default)(this.configuration, mapGroup);

      return {
        id: this.product.id,
        instructions: this.instructions,
        made_for: this.madeFor,
        option_groups: option_groups
      };
    }
  }, {
    key: '_applyDefaultConfiguration',
    value: function _applyDefaultConfiguration() {
      var _this2 = this;

      (this.product.option_groups || []).forEach(function (og) {
        og.option_items.forEach(function (oi) {
          // If opt_is_default is 1, add it as an option!
          if (oi.opt_is_default) {
            // This should never fail, but if it does it's not a deal breaker.
            try {
              _this2.addOption(og, oi);
            } catch (e) {}
          }
        });
      });
      return this.configuration;
    }
  }, {
    key: '_generateOperationMaps',
    value: function _generateOperationMaps() {
      var _this3 = this;

      var maps = (0, _lodash10.default)((0, _lodash6.default)(this.optionGroups(), function (optionGroup) {
        var configGroup = _this3.configurationForGroup(optionGroup.id);
        var currentlySelectedCount = configGroup ? configGroup.optionItems.length : 0;
        var canAddMoreToThisGroup = optionGroup.max_options === 0 || currentlySelectedCount < optionGroup.max_options;
        var requiresMoreInThisGroup = currentlySelectedCount < optionGroup.min_options;

        var remainingIncludedOptions = optionGroup.included_options - currentlySelectedCount;
        var additionalOptionsCount = currentlySelectedCount - optionGroup.included_options;

        if (remainingIncludedOptions < 0) {
          remainingIncludedOptions = 0;
        }
        if (additionalOptionsCount < 0) {
          additionalOptionsCount = 0;
        }

        var extraOptionsWillIncurCost = canAddMoreToThisGroup ? remainingIncludedOptions === 0 : false;

        return {
          id: optionGroup.id,
          optionGroupData: optionGroup,
          name: optionGroup.name,
          canAddMoreToThisGroup: canAddMoreToThisGroup,
          requiresMoreInThisGroup: requiresMoreInThisGroup,
          extraOptionsWillIncurCost: extraOptionsWillIncurCost,
          currentlySelectedCount: currentlySelectedCount,
          totalAllowedCount: optionGroup.max_options,
          remainingIncludedOptions: remainingIncludedOptions,
          additionalOptionsCount: additionalOptionsCount,
          totalEffectOnPrice: '0.00', /* This is overriden in the pricing loop below */
          optionItems: (0, _lodash10.default)((0, _lodash6.default)(optionGroup.option_items, function (option) {
            /* Find all currently added options of the same id */
            var matchingOptionItems = configGroup ? (0, _lodash4.default)(configGroup.optionItems, { id: option.id }) : [];
            var quantity = matchingOptionItems.length;
            var presence = quantity > 0 ? OptionStatus.PRESENT : OptionStatus.ABSENT;

            /* Build the allowd Operations here */
            var allowedOperations = [];
            if (canAddMoreToThisGroup) {
              allowedOperations.push({
                operation: OptionOperations.ADD,
                costPerOperation: extraOptionsWillIncurCost ? option.price : '0.00'
              });
            }
            if (presence === OptionStatus.PRESENT) {
              allowedOperations.push({
                operation: OptionOperations.REMOVE,
                costPerOperation: '0.00' /* Overriden Later in Pricing Loop */
              });
            }
            return {
              optionId: option.id,
              optionItemData: option,
              costPerUnit: option.price,
              presence: presence,
              allowedOperations: allowedOperations,
              quantity: quantity,
              effectOnPrice: '0.00', /* Overriden Later in Pricing Loop */
              quantityContributingToPrice: 0 /* Overriden Later in Pricing Loop */
            };
          }), function (i) {
            return i.menu_position;
          })
        };
      }), function (i) {
        return i.menu_position;
      });

      /* Loop through all options and determine cost incurred for each */
      maps.forEach(function (operationMap) {
        var _operationMap = operationMap;
        /* No additional options are selected, so set everything to "0.00" */
        if (_operationMap.additionalOptionsCount === 0) {
          return;
        }

        /* Additional Options are selected, so sort the optionItems array to find the most expensive */
        var presentItems = (0, _lodash4.default)(_operationMap.optionItems, function (i) {
          return i.presence === OptionStatus.PRESENT;
        });
        var mostExpensivePresentOptionItems = (0, _lodash12.default)((0, _lodash10.default)(presentItems, function (i) {
          return parseFloat(i.costPerUnit);
        }));

        /* Now work backwards from most expensive and attribute item to price */
        var catchup = 0;
        mostExpensivePresentOptionItems.forEach(function (item) {
          var _item = item;
          var catchupRequired = _operationMap.additionalOptionsCount - catchup;
          if (catchupRequired >= _item.quantity) {
            _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantity).toFixed(2);
            _item.quantityContributingToPrice = _item.quantity;
            var removalOperation = (0, _lodash2.default)(_item.allowedOperations, function (o) {
              return o.operation === OptionOperations.REMOVE;
            });
            removalOperation.costPerOperation = _item.costPerUnit;
            catchup += _item.quantity;
          } else {
            _item.quantityContributingToPrice = catchupRequired;
            _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantityContributingToPrice).toFixed(2);
            catchup += catchupRequired;
          }
          return _item;
        });

        var getTotal = function getTotal(sum, item) {
          return parseFloat(item.effectOnPrice) + sum;
        };
        _operationMap.totalEffectOnPrice = (0, _lodash14.default)(mostExpensivePresentOptionItems, getTotal, 0.00).toFixed(2);
      });
      this.operationMaps = maps;
      return maps;
    }
  }]);
  return LineItem;
}();

exports.default = LineItem;