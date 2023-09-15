import { getObjectFromLocalStorage } from '../../../utils/functions';

const ADMIN_UI_NODE_LIST = getObjectFromLocalStorage('admin-ui-node-list');

type InitialState = {
  status: {
    connecting: boolean;
    connected: boolean;
    error: {
      data: string | null;
      type: 'API_ERROR'  | 'NOT_ELIGIBLE_ERROR' | 'FETCH_ERROR'
    } | null;
  };
  loginData: {
    apiEndpoint: string | null;
    apiToken: string | null;
    localName: string | null;
    peerId: string | null;
  };
  nodes: {
    apiEndpoint: string | null;
    apiToken: string | null;
    localName: string | null;
  }[];
  helper: {
    openLoginModalToNode: boolean;
  };
};

export const initialState: InitialState = {
  status: {
    connecting: false,
    connected: false,
    error: null,
  },
  loginData: {
    apiEndpoint: null,
    apiToken: null,
    localName: null,
    peerId: null,
  },
  nodes: ADMIN_UI_NODE_LIST ? ADMIN_UI_NODE_LIST : [],
  helper: { openLoginModalToNode: false },
};
