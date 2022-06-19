import * as moment from 'moment';

moment.locale('mn');

const pagination = {
    items_per_page: '/ хуудас',
    jump_to: 'шилжих',
    jump_to_confirm: 'баталгаажуулах',
    page: '',

    prev_page: 'Өмнөх хуудас',
    next_page: 'Дараагийн хуудас',
    prev_5: '5 хуудасны өмнө',
    next_5: '5 хуудасны дараа',
    prev_3: '3 хуудасны өмнө',
    next_3: '3 хуудасны дараа'
};
const timePicker = {
    placeholder: 'Өдөр сонгоно уу'
};
const calendar = {
    today: 'Өнөөдөр',
    now: 'Одоо',
    backToToday: 'Өнөөдөр лүү буцах',
    ok: 'Ок',
    clear: 'Цэвэрлэх',
    month: "Сар",
    year: "Жил",
    timeSelect: "Цаг сонгоно уу",
    dateSelect: "Өдөр сонгоно уу",
    monthSelect: "Сар сонгоно уу",
    yearSelect: "Жил сонгоно уу",
    decadeSelect: "10-аар багцалсан жилээс сонгоно уу",
    yearFormat: 'YYYY',
    dateFormat: 'M/D/YYYY',
    dayFormat: 'D',
    dateTimeFormat: 'M/D/YYYY HH:mm:ss',
    monthBeforeYear: true,
    previousMonth: "Өмнөх сар (PageUp товч дар)",
    nextMonth: "Дараа сар (PageDown товч дар)",
    previousYear: "Өнгөрсөн жил (Control + left товч дар)",
    nextYear: "Дараа жил (Control + right товч дар)",
    previousDecade: "Сүүлийн 10 жил",
    nextDecade: "Дараагийн 10 жил",
    previousCentury: "Өнгөрсөн зуун",
    nextCentury: "Дараагийн зуун"
};
const datePicker = {
    lang: {
        placeholder: 'Өдөр сонгоно уу',
        rangePlaceholder: ['Эхлэх өдөр', 'Дуусах өдөр'],
        ...calendar
    },
    timePickerLocale: {
        ...timePicker
    }
};
const calendarFormater = {
    months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
    monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
    weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
}
export default {
    locale: 'mn',
    Pagination: pagination,
    DatePicker: datePicker,
    TimePicker: timePicker,
    Calendar: datePicker,
    Table: {
        filterTitle: "Шүүлт хийх",
        filterConfirm: "Ок",
        filterReset: "Шинэчлэх",
        selectAll: "Одоогийн хуудсыг сонгоно уу",
        selectInvert: 'Одоогийн хуудсыг эргүүлэх'
    },
    Modal: {
        okText: 'Ок',
        cancelText: 'Цуцлах',
        justOkText: 'Ок'
    },
    Popconfirm: {
        okText: 'Ок',
        cancelText: 'Цуцлах'
    },
    Transfer: {
        notFoundContent: "Олдсонгүй",
        searchPlaceholder: "Энд хайна уу",
        itemUnit: "Зүйлс",
        itemsUnit: 'Зүйлс'
    },
    Select: {
        notFoundContent: 'Олдсонгүй'
    },
    Upload: {
        uploading: "Уншиж байна ...",
        removeFile: "файлыг хас",
        uploadError: "Хуулахад алдаа гарлаа",
        previewFile: "Файлыг үзэх"
    },
    Empty: {
      description: "Мэдээлэл байхгүй"
    },
    CalendarFormater: calendarFormater
};
