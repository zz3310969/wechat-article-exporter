<script setup lang="ts">
import { type Info } from '~/store/v2/info';
import GlobalSearchAccount from '~/components/global/SearchAccount.vue';
import type { AccountInfo } from '~/types/types';
import { AgGridVue } from 'ag-grid-vue3';
import {
  type ColDef,
  type GetRowIdParams,
  type GridApi,
  type GridOptions,
  type GridReadyEvent,
  type ICellRendererParams,
  type IDateFilterParams,
  ModuleRegistry,
  type SelectionChangedEvent,
  themeQuartz,
  type ValueFormatterParams,
  type ValueGetterParams,
} from 'ag-grid-community';
import { AG_GRID_LOCALE_CN } from '@ag-grid-community/locale';
import GridLoading from '~/components/grid/Loading.vue';
import GridNoRows from '~/components/grid/NoRows.vue';
import { deleteAccountData } from '~/store/v2';
import { getAllInfo, getInfoCache } from '~/store/v2/info';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { getArticleList } from '~/apis';
import { getArticleCache, hitCache } from '~/store/v2/article';
import GridActions from '~/components/grid/AccountActions.vue';
import GridLoadProgress from '~/components/grid/LoadProgress.vue';
import ConfirmModal from '~/components/modal/Confirm.vue';
import { formatTimeStamp } from '~/utils';
import StorageUsage from '~/components/StorageUsage.vue';

ModuleRegistry.registerModules([AllEnterpriseModule]);
// LicenseManager.setLicenseKey('[v3][0102]_MTc1NjY1NjAwMDAwMA==c5ac76aeee205aafd39087f0ad4063a5');
LicenseManager.setLicenseKey(
  'TrialOnlyLicenseia9dan0c[TRIAL][v0102]_MTc1MjI0OTYwMDAwMA==46cc5a45d5d97e853905e4e70743d26a'
);

useHead({
  title: '公众号管理 | 微信公众号文章导出',
});

const loginAccount = useLoginAccount();

const searchAccountRef = ref<typeof GlobalSearchAccount | null>(null);

const addBtnLoading = ref(false);
function addAccount() {
  searchAccountRef.value!.open();
}
async function selectAccount(account: AccountInfo) {
  addBtnLoading.value = true;
  await loadAccountArticle(account, 0, false);
  await refresh();
  addBtnLoading.value = false;
}

async function loadAccountArticle(account: AccountInfo, begin: number, next: boolean) {
  syncingRowId.value = account.fakeid;
  isSyncing.value = true;

  const [articles, completed] = await getArticleList(account, loginAccount.value.token, begin);
  if (completed) {
    await updateRow(account.fakeid);
    syncingRowId.value = null;
    isSyncing.value = false;
    return;
  }

  const count = articles.filter(article => article.itemidx === 1).length;
  begin += count;

  // 加载可用的缓存
  const lastArticle = articles.at(-1);
  if (lastArticle) {
    // 检查是否存在比 lastArticle 更早的缓存数据
    if (await hitCache(account.fakeid, lastArticle.create_time)) {
      const cachedArticles = await getArticleCache(account.fakeid, lastArticle.create_time);

      // 更新 begin 参数
      const count = cachedArticles.filter(article => article.itemidx === 1).length;
      begin += count;
    }
  }
  await updateRow(account.fakeid);
  if (next) {
    timer.value = window.setTimeout(() => {
      loadAccountArticle(account, begin, true);
    }, 2000);
  } else {
    syncingRowId.value = null;
    isSyncing.value = false;
  }
}

const loading = ref(false);
const isDeleting = ref(false);
const isSyncing = ref(false);
const syncingRowId = ref<string | null>(null);
const timer = ref<number | null>(null);
let globalRowData: any[] = [];

const filterParams: IDateFilterParams = {
  filterOptions: ['lessThan', 'greaterThan', 'inRange'],
  comparator: (filterLocalDateAtMidnight: Date, cellValue: Date) => {
    const t = filterLocalDateAtMidnight;
    if (cellValue < t) {
      return -1;
    } else if (cellValue === t) {
      return 0;
    } else {
      return 1;
    }
  },
};
const booleanColumnFilterParams = {
  suppressMiniFilter: true,
  values: [true, false],
  valueFormatter: (params: ValueFormatterParams) => (params.value ? '是' : '否'),
};

const columnDefs = ref<ColDef[]>([
  {
    headerName: 'fakeid',
    field: 'fakeid',
    cellDataType: 'text',
    filter: 'agTextColumnFilter',
    minWidth: 200,
    cellClass: 'font-mono',
    hide: true,
  },
  {
    headerName: '头像',
    field: 'round_head_img',
    sortable: false,
    filter: false,
    cellRenderer: (params: ICellRendererParams) => {
      return `<img alt="" src="${params.value}" style="height: 30px; width: 30px; object-fit: cover;" />`;
    },
    cellClass: 'flex justify-center items-center',
    minWidth: 80,
  },
  {
    headerName: '名称',
    field: 'nickname',
    cellDataType: 'text',
    filter: 'agTextColumnFilter',
    filterParams: {
      filterOptions: ['contains', 'notContains'],
      maxNumConditions: 1,
    },
    tooltipField: 'nickname',
    minWidth: 200,
  },
  {
    headerName: '添加时间',
    field: 'create_time',
    valueFormatter: p => (p.value ? formatTimeStamp(p.value) : ''),
    filter: 'agDateColumnFilter',
    filterParams: filterParams,
    filterValueGetter: (params: ValueGetterParams) => {
      return new Date(params.getValue('create_time') * 1000);
    },
    minWidth: 180,
    hide: true,
    cellClass: 'flex justify-center items-center font-mono',
  },
  {
    headerName: '最后同步时间',
    field: 'update_time',
    valueFormatter: p => (p.value ? formatTimeStamp(p.value) : ''),
    filter: 'agDateColumnFilter',
    filterParams: filterParams,
    filterValueGetter: (params: ValueGetterParams) => {
      return new Date(params.getValue('update_time') * 1000);
    },
    minWidth: 180,
    // hide: true,
    cellClass: 'flex justify-center items-center font-mono',
  },
  {
    headerName: '消息总数',
    field: 'total_count',
    cellClass: 'flex justify-center items-center font-mono',
    minWidth: 150,
  },
  {
    headerName: '已加载消息数',
    field: 'count',
    cellDataType: 'number',
    filter: 'agNumberColumnFilter',
    cellClass: 'flex justify-center items-center font-mono',
    minWidth: 150,
  },
  {
    headerName: '已加载文章数',
    field: 'articles',
    cellDataType: 'number',
    filter: 'agNumberColumnFilter',
    cellClass: 'flex justify-center items-center font-mono',
    minWidth: 150,
  },
  {
    headerName: '加载进度',
    field: 'fakeid',
    cellRenderer: GridLoadProgress,
    cellRendererParams: {
      // percent: Math.round((props.params.data.count / props.params.data.total_count) * 100),
    },
    minWidth: 200,
  },
  {
    headerName: '状态',
    field: 'completed',
    cellDataType: 'boolean',
    filter: 'agSetColumnFilter',
    filterParams: booleanColumnFilterParams,
    cellClass: 'flex justify-center items-center',
    headerClass: 'justify-center',
    minWidth: 100,
  },
  {
    headerName: '操作',
    field: 'fakeid',
    sortable: false,
    filter: false,
    cellRenderer: GridActions,
    cellRendererParams: {
      onSync: (params: ICellRendererParams) => {
        loadAccountArticle(params.data, 0, true);
      },
      onStop: (params: ICellRendererParams) => {
        syncingRowId.value = null;
        isSyncing.value = false;
        clearTimeout(timer.value!);
      },
      isSyncing: isSyncing,
      syncingRowId: syncingRowId,
      isDeleting: isDeleting,
    },
    cellClass: 'flex justify-center items-center',
    maxWidth: 100,
    pinned: 'right',
  },
]);

const gridOptions: GridOptions = {
  localeText: AG_GRID_LOCALE_CN,
  rowNumbers: true,
  loadingOverlayComponent: GridLoading,
  noRowsOverlayComponent: GridNoRows,
  getRowId: (params: GetRowIdParams) => String(params.data.fakeid),
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        minWidth: 225,
        maxWidth: 225,
        width: 225,
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivotMode: true,
        },
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
        minWidth: 180,
        maxWidth: 400,
        width: 250,
      },
    ],
    position: 'right',
  },
  enableCellTextSelection: true,
  tooltipShowDelay: 0,
  tooltipShowMode: 'whenTruncated',
  suppressContextMenu: true,
  defaultColDef: {
    sortable: true,
    filter: true,
    flex: 1,
    enableCellChangeFlash: false,
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    enableValue: true,
    enableRowGroup: true,
  },
  selectionColumnDef: {
    sortable: true,
    width: 80,
    pinned: 'left',
  },
  rowSelection: {
    mode: 'multiRow',
    headerCheckbox: true,
    selectAll: 'filtered',
  },
  theme: themeQuartz.withParams({
    borderColor: '#e5e7eb',
    rowBorder: true,
    columnBorder: true,
    headerFontWeight: 700,
    oddRowBackgroundColor: '#00005506',
    sidePanelBorder: true,
  }),
};

const gridApi = shallowRef<GridApi | null>(null);
function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api;

  restoreColumnState();
  refresh();
}

function onColumnStateChange() {
  if (gridApi.value) {
    saveColumnState();
  }
}
function saveColumnState() {
  const state = gridApi.value?.getColumnState();
  localStorage.setItem('agGridColumnState-account', JSON.stringify(state));
}

function restoreColumnState() {
  const stateStr = localStorage.getItem('agGridColumnState-account');
  if (stateStr) {
    const state = JSON.parse(stateStr);
    gridApi.value?.applyColumnState({
      state,
      applyOrder: true,
    });
  }
}

async function refresh() {
  loading.value = true;
  globalRowData = await getAllInfo();
  gridApi.value?.setGridOption('rowData', globalRowData);
  loading.value = false;
}

async function updateRow(fakeid: string) {
  const rowNode = gridApi.value?.getRowNode(fakeid);
  if (rowNode) {
    const info = await getInfoCache(fakeid);
    rowNode.updateData(info);
  }
}

const selectedRows = shallowRef<Info[]>([]);
function onSelectionChanged(evt: SelectionChangedEvent) {
  selectedRows.value = evt.selectedNodes?.map(node => node.data) || [];
}

const modal = useModal();

function deleteSelectedAccounts() {
  const ids = selectedRows.value.map(info => info.fakeid);
  modal.open(ConfirmModal, {
    title: '是否确定删除所选公众号数据？',
    description: '删除之后，该公众号的所有数据(包括已下载的文章和留言等)都将被清空',
    async onConfirm() {
      isDeleting.value = true;
      await deleteAccountData(ids);
      isDeleting.value = false;
      await refresh();
    },
  });
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div>
      <h1 class="text-[28px] leading-[34px] text-slate-12 dark:text-slate-50 font-bold">
        公众号管理
        <StorageUsage />
      </h1>
    </div>

    <div class="flex flex-col h-full divide-y divide-gray-200">
      <!-- 顶部筛选与操作区 -->
      <header class="flex items-center gap-3 px-3 py-2">
        <UButton color="blue" :disabled="isDeleting || addBtnLoading" @click="addAccount">{{
          addBtnLoading ? '添加中...' : '添加公众号'
        }}</UButton>
        <UButton
          color="rose"
          icon="i-heroicons:trash"
          :loading="isDeleting"
          :disabled="selectedRows.length === 0"
          @click="deleteSelectedAccounts"
          >删除所选公众号</UButton
        >
        <UButton
          color="blue"
          icon="i-heroicons:arrow-path-rounded-square-20-solid"
          :disabled="isDeleting || selectedRows.length === 0"
          >同步所选公众号</UButton
        >
      </header>

      <ag-grid-vue
        style="width: 100%; height: 100%"
        :loading="loading"
        :rowData="globalRowData"
        :columnDefs="columnDefs"
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
        @column-moved="onColumnStateChange"
        @column-visible="onColumnStateChange"
        @column-pinned="onColumnStateChange"
        @column-resized="onColumnStateChange"
      ></ag-grid-vue>
    </div>

    <GlobalSearchAccount ref="searchAccountRef" @select:account="selectAccount" />
  </div>
</template>
