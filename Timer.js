//获取课表第一天日期
function fetchCourseInfoForWeek(week) {
  const data = { zc: week }; // 这里只需要设置周数

  return fetch('https://tzvcst.jw.chaoxing.com/admin/getXqByZc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams(data).toString() // 将对象转换为查询字符串格式
  })
  .then(response => response.json())
  .catch(error => {
    console.error('Error:', error);
  });
}


// 寻找默认选中的学年学期
async function fetchSelectedYear() {
  const path = '/admin/pkgl/xskb/queryKbForXsd';
  const contentDom = await fetch(path).then(res => res.text()).then(text => new DOMParser().parseFromString(text, 'text/html'));

  const selectElement = contentDom.getElementById('xnxq1');
  const options = selectElement.querySelectorAll('option');
  for (const option of options) {
      if (option.selected) {
        const selectedYear = option.value.split('-');
        console.log('Selected year:', selectedYear);
        return selectedYear;
      }
  }
}

// 获取默认课表第一天转换为时间戳
async function toTimestamp() {
  const selectedYear = await fetchSelectedYear(); // 等待fetchSelectedYear函数的异步操作完成
  console.log('Selected year in toTimestamp:', selectedYear);
  const year = selectedYear[2] === '1' ? selectedYear[0] : selectedYear[1];
  const data = await fetchCourseInfoForWeek(1); // 等待fetchCourseInfoForWeek函数的异步操作完成
  console.log('Data in toTimestamp:', data);
  // data.data才是真正的课程信息
  if (data && data.data && data.data.length > 0) {
    const firstDay = data.data[0]; // 第一天的课程信息
    const [month, day] = firstDay.date.split('-').map(Number);
    const timestamp = Date.UTC(year, month - 1, day);
    return timestamp;
  } else {
    return null;
  }
}






function findMaxWeek(courses) {
  return courses.reduce((max, course) => {
    // 找到当前课程weeks数组中的最大值
    const currentMax = Math.max(...course.weeks);
    // 返回当前最大值和累积最大值中的较大者
    return Math.max(max, currentMax);
  }, 0); // 初始值设置为0
}

async function scheduleTimer({
parserRes
} = {}) {
  const obj = {};
  if (parserRes) {
      obj.totalWeek = findMaxWeek(parserRes);
  }

  obj.forenoon = 5;
  obj.afternoon = 4;
  obj.night = 3;

  obj.startSemester = (await toTimestamp()).toString();

  // 从网页中获取课程时间
  obj.sections = Array.from(document.querySelectorAll('.td-course-time')).flatMap(element => {
    const courseNumElement = element.querySelector('.course-num');
    const section = parseInt(courseNumElement.textContent, 10);
    if (isNaN(section)) {
      return []; // 如果section不是数字，返回一个空数组，flatMap会将其展平，相当于跳过这个元素
    }
    const startTime = element.querySelector('.time-start').textContent;
    const endTime = element.querySelector('.time-end').textContent;
    return [{ section, startTime, endTime }];
  });
  return obj;
}