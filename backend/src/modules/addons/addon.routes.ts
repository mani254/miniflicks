import { createCrudRouter } from '../../shared/utils/crudRouter';
import { Addon } from './addon.schema';

const addonRouter = createCrudRouter(Addon, 'addon', 'addons', { uploadFolder: 'addons' });
export default addonRouter;
