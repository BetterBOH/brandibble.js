const ServiceTypes = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
};

const OrderTypes = {
  ONLINE_ORDERING: 'olo',
  CATERING: 'catering',
};

const OptionOperations = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

const OptionStatus = {
  ABSENT: 'ABSENT',
  PRESENT: 'PRESENT',
};

export default { ServiceTypes, OrderTypes, OptionOperations, OptionStatus };
