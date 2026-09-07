import { createCrudRouter } from '../../shared/utils/crudRouter';
import { City } from './city.schema';

const cityRouter = createCrudRouter(City, 'city', 'cities', ['locations']);
export default cityRouter;
