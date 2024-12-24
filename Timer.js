// 获取信息查询URL
async function getCourseInfoUrl() {
  let links = document.querySelectorAll(".radius a");
  for (let link of links) {
    // 检查标题是否为 '信息查询'
    if (link.title === "信息查询") {
      // console.log("成功获取到信息查询URL: " + link.href);
      return link.href; // 返回符合条件的链接的完整 URL
    }
  }
  await loadTool("AIScheduleTools");
  await AIScheduleAlert("时间相关URL获取失败，请联系维护同学修复");
  return null;
}

// 获取课表按照周数的日期
async function fetchDateInfoForWeek(week) {
  try {
    const response = await fetch(
      "https://tzvcst.jw.chaoxing.com/admin/getXqByZc",
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams({ zc: week }),
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`网络错误 status: ${response.status}`);
    }

    const result = await response.json();
    // console.log(`获取到的第 ${week} 周日期:`, result.data);
    return result.data;
  } catch (error) {
    // console.error("获取周数据失败:", error);
    await AIScheduleAlert({
      titleText: "错误",
      contentText: String(error),
    });
  }
}

// 获取当前学年学期
async function getCurrentSemester() {
  try {
    const response = await fetch("/admin/xsd/xyjc/getXsjbxx");

    if (!response.ok) {
      throw new Error(`网络错误 status: ${response.status}`);
    }

    const result = await response.json();
    if (result.ret === 0 && result.data && result.data.dqxnxq) {
      // console.log("当前学年学期:", result.data.dqxnxq);
      return result.data.dqxnxq;
    } else {
      throw new Error("获取学期信息失败: " + result.msg);
    }
  } catch (error) {
    // console.error("请求当前学期信息出错:", error);
    await AIScheduleAlert({
      titleText: "错误",
      contentText: String(error),
    });
  }
}

// 获取默认课表第一天转换为时间戳
async function getFirstDayTimestamp() {
  const url = await getCourseInfoUrl();
  if (!url) {
    console.error("getCourseInfoUrl() 未成功获取到 URL");
    return null;
  }

  const semester = await getCurrentSemester();
  if (!semester) {
    console.error("getSemester() 未成功获取到当前学年学期");
    return null;
  }
  const semesterArray = semester.split("-");
  const year = semesterArray[2] === "1" ? semesterArray[0] : semesterArray[1];
  console.log("分割后的当前年:", year);

  const data = await fetchDateInfoForWeek(1);
  if (!data || data.length === 0) {
    console.error("按照周数获取到的日期没有");
    return null;
  }
  const firstDay = data[0];
  const [month, day] = firstDay.date.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  return timestamp;
}

function findMaxWeek(courses) {
  return courses.reduce((max, course) => {
    // 找到当前课程weeks数组中的最大值
    const currentMax = Math.max(...course.weeks);
    // 返回当前最大值和累积最大值中的较大者
    return Math.max(max, currentMax);
  }, 0); // 初始值设置为0
}

async function fetchCourseTimes() {
  try {
    const response = await fetch(
      "https://tzvcst.jw.chaoxing.com/admin/system/zy/xlgl/selectJxzxsjXq/" +
        (await getCurrentSemester()),
    );

    if (!response.ok) {
      throw new Error(`网络错误 status: ${response.status}`);
    }
    const result = await response.json();
    if (result && result.list && result.list.length > 0) {
      const sections = result.list.map((item) => ({
        section: parseInt(item.jc, 10),
        startTime: item.kssj,
        endTime: item.jssj,
      }));

      // console.log("转换后的课程时间:", sections);
      return sections;
    } else {
      throw new Error("获取数据失败或数据为空");
    }
  } catch (error) {
    // console.error("课程时间获取失败:", error);
    await AIScheduleAlert({
      titleText: "错误",
      contentText: String(error),
    });
  }
}

// 分类
function categorizeSections(sections) {
  let forenoon = 0,
    afternoon = 0,
    night = 0;
  sections.forEach((section) => {
    const startHour = parseInt(section.startTime.split(":")[0], 10);
    if (startHour < 12) {
      forenoon++;
    } else if (startHour < 18) {
      afternoon++;
    } else {
      night++;
    }
  });
  return { forenoon, afternoon, night };
}

async function scheduleTimer({ parserRes } = {}) {
  await loadTool("AIScheduleTools");
  const obj = {};
  if (parserRes) {
    obj.totalWeek = findMaxWeek(parserRes);
  }

  // 开学时间（时间戳）
  const startSemester = await getFirstDayTimestamp();
  if (startSemester === null) {
    await AIScheduleAlert("无法获取开学时间，请联系维护同学修复");
  } else {
    obj.startSemester = startSemester.toString();
  }

  // 从网页中获取课程时间
  const sections = await fetchCourseTimes();
  obj.sections = sections;

  // 课程节数
  if (sections) {
    const { forenoon, afternoon, night } = categorizeSections(sections);
    obj.forenoon = forenoon;
    obj.afternoon = afternoon;
    obj.night = night;
  } else {
    await AIScheduleAlert("无法获取课程时间，请联系维护同学修复");
  }

  return obj;
}
