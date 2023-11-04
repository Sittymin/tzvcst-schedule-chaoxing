function findMaxWeek(courses) {
  return courses.reduce((max, course) => {
    // 找到当前课程weeks数组中的最大值
    const currentMax = Math.max(...course.weeks);
    // 返回当前最大值和累积最大值中的较大者
    return Math.max(max, currentMax);
  }, 0); // 初始值设置为0
}

function scheduleTimer({
parserRes
} = {}) {
  const obj = {};
  if (parserRes) {
      obj.totalWeek = findMaxWeek(parserRes);
  }

  obj.showWeekend = false; // 是否显示周末
  obj.forenoon = 5;
  obj.afternoon = 4;
  obj.night = 3;

  //硬定义课程时间
  obj.sections = [{
    section: 1,
    startTime: '8:00',
    endTime: '8:40',
  },{
    section: 2,
    startTime: '8:50',
    endTime: '9:30',
  },{
    section: 3,
    startTime: '9:40',
    endTime: '10:20',
  },{
    section: 4,
    startTime: '10:30',
    endTime: '11:10',
  },{
    section: 5,
    startTime: '11:20',
    endTime: '12:00',
  },{
    section: 6,
    startTime: '13:30',
    endTime: '14:10',
  },{
    section: 7,
    startTime: '14:20',
    endTime: '15:00',
  },{
    section: 8,
    startTime: '15:10',
    endTime: '15:50',
  },{
    section: 9,
    startTime: '16:00',
    endTime: '16:40',
  },{
    section: 10,
    startTime: '18:30',
    endTime: '19:10',
  },{
    section: 11,
    startTime: '19:20',
    endTime: '20:00',
  },{
    section: 12,
    startTime: '20:10',
    endTime: '20:50',
  }]
  return obj;
}