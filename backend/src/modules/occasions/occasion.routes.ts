import { createCrudRouter } from '../../shared/utils/crudRouter';
import { Occasion } from './occasion.schema';

const occasionRouter = createCrudRouter(Occasion, 'occasion', 'occasions', { uploadFolder: 'occasions' });
export default occasionRouter;
