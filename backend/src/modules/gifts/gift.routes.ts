import { createCrudRouter } from '../../shared/utils/crudRouter';
import { Gift } from './gift.schema';

const giftRouter = createCrudRouter(Gift, 'gift', 'gifts', { uploadFolder: 'gifts' });
export default giftRouter;
