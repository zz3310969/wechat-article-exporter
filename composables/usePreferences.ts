import { StorageSerializers } from '@vueuse/core';
import type { Preferences } from '~/types/preferences';
import { MP_ORIGIN_TIMESTAMP } from '~/config';

const defaultOptions: Partial<Preferences> = {
  hideDeleted: true,
  privateProxyList: [],
  privateProxyAuthorization: '',
  exportConfig: {
    dirname: '${title}',
    exportExcelIncludeContent: false,
    exportJsonIncludeComments: false,
    exportJsonIncludeContent: false,
    exportHtmlIncludeComments: false,
  },
  downloadConfig: {
    forceDownloadContent: false,
  },
  accountSyncSeconds: 5,
  syncDateRange: 'all',
  syncDatePoint: MP_ORIGIN_TIMESTAMP,
};

export default () => {
  //@ts-ignore
  return useLocalStorage<Preferences>('preferences', defaultOptions, {
    serializer: StorageSerializers.object,
    mergeDefaults: true,
  });
};
