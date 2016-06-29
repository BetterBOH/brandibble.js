import { buildRef, TestingUser } from './helpers';
let BrandibbleRef = buildRef();

before(done => {
  BrandibbleRef.customers.create(TestingUser).then(() => done()).catch(() => done());
});
