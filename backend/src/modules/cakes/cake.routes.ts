import { createCrudRouter } from '../../shared/utils/crudRouter';
import { Cake } from './cake.schema';

const cakeRouter = createCrudRouter(Cake, 'cake', 'cakes', { uploadFolder: 'cakes' });
export default cakeRouter;
