const ServiceTypes = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
};

const OrderTypes = {
  ONLINE_ORDERING: 'olo',
  CATERING: 'catering',
};

const OptionItemsOperations = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

const OptionItemsStatus = {
  ABSENT: 'ABSENT',
  PRESENT: 'PRESENT',
};

export default { ServiceTypes, OrderTypes, OptionItemsOperations, OptionItemsStatus };
