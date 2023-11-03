/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
    providerRes,
    parserRes
  } = {}) {
    // 支持异步操作 推荐await写法

    // 这是一个示例函数，用于演示，正常用不到可以删掉
    const someAsyncFunc = () => new Promise(resolve => {
      setTimeout(() => resolve(), 1)
    })
    await someAsyncFunc()

    // 这个函数中也支持使用 AIScheduleTools 譬如给出多条时间配置让用户选择之类的

    // 返回时间配置JSON，所有项都为可选项，如果不进行时间配置，请返回空对象
    return {
      totalWeek: 20, // 总周数：[1, 30]之间的整数
      startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      showWeekend: false, // 是否显示周末
      forenoon: 1, // 上午课程节数：[1, 10]之间的整数
      afternoon: 0, // 下午课程节数：[0, 10]之间的整数
      night: 0, // 晚间课程节数：[0, 10]之间的整数
      sections: [{
        section: 1, // 节次：[1, 30]之间的整数
        startTime: '08:00', // 开始时间：参照这个标准格式5位长度字符串
        endTime: '08:50', // 结束时间：同上
      }], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
    // PS: 夏令时什么的还是让用户在夏令时的时候重新导入一遍吧，在这个函数里边适配吧！奥里给！————不愿意透露姓名的嘤某人
  }