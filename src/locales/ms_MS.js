import * as moment from 'moment';

moment.locale('zh-cn');

const pagination = {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页',

    prev_page: '上一页',
    next_page: '下一页',
    prev_5: '向前 5 页',
    next_5: '向后 5 页',
    prev_3: '向前 3 页',
    next_3: '向后 3 页'
};
const timePicker = {
    placeholder: '请选择时间'
};
const calendar = {
    today: '今天',
    now: '此刻',
    backToToday: '返回今天',
    ok: '确定',
    timeSelect: '选择时间',
    dateSelect: '选择日期',
    clear: '清除',
    month: '月',
    year: '年',
    previousMonth: '上个月 (翻页上键)',
    nextMonth: '下个月 (翻页下键)',
    monthSelect: '选择月份',
    yearSelect: '选择年份',
    decadeSelect: '选择年代',
    yearFormat: 'YYYY年',
    dayFormat: 'D日',
    dateFormat: 'YYYY年M月D日',
    dateTimeFormat: 'YYYY年M月D日 HH时mm分ss秒',
    previousYear: '上一年 (Control键加左方向键)',
    nextYear: '下一年 (Control键加右方向键)',
    previousDecade: '上一年代',
    nextDecade: '下一年代',
    previousCentury: '上一世纪',
    nextCentury: '下一世纪'
};
const datePicker = {
    lang: {
        placeholder: '请选择日期',
        rangePlaceholder: ['开始日期', '结束日期'],
        ...calendar
    },
    timePickerLocale: {
        ...timePicker
    }
};

export default {
    locale: 'zh-cn',
    Pagination: pagination,
    DatePicker: datePicker,
    TimePicker: timePicker,
    Calendar: datePicker,
    Table: {
        filterTitle: '筛选',
        filterConfirm: '确定',
        filterReset: '重置',
        selectAll: '全选当页',
        selectInvert: '反选当页'
    },
    Modal: {
        okText: '确定',
        cancelText: '取消',
        justOkText: '知道了'
    },
    Popconfirm: {
        cancelText: '取消',
        okText: '确定'
    },
    Transfer: {
        notFoundContent: '无匹配结果',
        searchPlaceholder: '请输入搜索内容',
        itemUnit: '项',
        itemsUnit: '项'
    },
    Select: {
        notFoundContent: '无匹配结果'
    },
    Upload: {
        uploading: '文件上传中',
        removeFile: '删除文件',
        uploadError: '上传错误',
        previewFile: '预览文件'
    },
    Empty: {
      description: '暂无数据'
    }
};
