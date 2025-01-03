async function scheduleHtmlProvider(
  iframeContent = "",
  frameContent = "",
  dom = document,
) {
  await loadTool("AIScheduleTools");
  if (!dom.querySelector(".userInfo")) {
    await AIScheduleAlert("你还没登录, 估计不会按照预期执行");
  } else {
    await AIScheduleAlert("点击确认开始导入，不要重复按“一键导入”");
  }

  // 具体课表位置
  const path = "/admin/pkgl/xskb/queryKbForXsd";

  // 获取具体课表的 HTML 文档
  const contentDom = await fetch(path)
    .then((res) => res.text())
    .then((text) => new DOMParser().parseFromString(text, "text/html"));

  // 从转换后的 HTML 文档中获取 xhid 和 xqdm 的值
  const xhid = contentDom.querySelector("#xhid").value;
  const xqdm = contentDom.querySelector("#xqdm").value;

  let xnxq = null;
  // 下面不可以用自定义函数不然导入按钮没有反应
  // 获取当前学年学期
  try {
    const response = await fetch("/admin/xsd/xyjc/getXsjbxx");
    if (!response.ok) {
      throw new Error("网络请求失败");
    }
    const result = await response.json();
    if (result.ret === 0 && result.data && result.data.dqxnxq) {
      // console.log("当前学年学期:", result.data.dqxnxq);
      xnxq = result.data.dqxnxq;
    } else {
      throw new Error("获取学期信息失败: " + result.msg);
    }
  } catch (error) {
    console.log("请求当前学期信息出错:", error);
  }

  if (!xnxq) {
    const arr = [];
    for (let option of contentDom.querySelectorAll("#xnxq1>option")) {
      const value = option.value;
      if (value) {
        arr.push(value);
      }
    }
    // 显示选择列表
    xnxq = await AIScheduleSelect({
      contentText: "请选择学年学期",
      selectList: arr,
    });
  }

  // 清理标签与最终返回部分
  // 获取课表具体数据
  return fetch(
    "/admin/pkgl/xskb/sdpkkbList?" +
      new URLSearchParams({
        xnxq,
        xhid,
        xqdm,
      }),
  )
    .then((res) => res.json())
    .then((data) => {
      // console.log("原始课表数据:", data);
      return data.map((info) => {
        return {
          name: cleanTag(info.kcmc), // 课程名称
          teacher: cleanTag(info.tmc), // 教师名称
          position: cleanTag(info.croommc), // 上课地点
          sections: info.djc, // 节次
          weeks: info.zcstr.split(",").map(Number), // 上课周数(分割并转换为数组)
          day: info.xingqi, // 星期
        };
      });
    })
    .then((data) => {
      // console.log("格式化数据:", data);
      // 这里必须转换为 string 不然不会正确传递给 Parser
      return JSON.stringify(data);
    });
}

// 去除HTML标签
function cleanTag(str) {
  return new DOMParser()
    .parseFromString(str, "text/html")
    .body.textContent.trim();
}
