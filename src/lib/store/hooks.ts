/**
 * Redux Hooks Tipados
 */

import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState, AppStore } from './index';

// Use estes hooks tipados em vez dos hooks padrão do react-redux
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
