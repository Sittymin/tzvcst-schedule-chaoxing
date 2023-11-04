function scheduleHtmlParser(html) {
  // 假设 html 是一个 JSON 字符串，首先将其解析为对象
  let infos = JSON.parse(html);
  // 然后调用 format 函数来处理这些信息
  infos = format(infos);
  console.log('infos', infos);
  // 返回处理后的信息
  return infos;
}

function format(infos) {
  let mergedCourses = infos.reduce((acc, course) => {
    // 确保 weeks 和 sections 是数组
    let weeks = Array.isArray(course.weeks) ? course.weeks : [course.weeks];
    let sections = Array.isArray(course.sections) ? course.sections : [course.sections];

    // 创建一个不包含 sections 的键，用于比较和存储
    let key = `${course.name}-${course.position}-${course.teacher}-${weeks.join(',')}-${course.day}`;
    // 如果这个键还没有被处理过，就在累加器中为它创建一个新对象
    if (!acc[key]) {
      acc[key] = { ...course, sections: sections, weeks: weeks };
    } else {
      // 如果这个键已经存在，就合并当前的 sections 和 weeks 数组到对应对象的数组中
      // 使用 Set 来去除重复的节次和周数
      acc[key].sections = Array.from(new Set([...acc[key].sections, ...sections]));
      acc[key].weeks = Array.from(new Set([...acc[key].weeks, ...weeks]));
    }
    return acc;
  }, {});

  // 将累加器对象的值转换为数组
  return Object.values(mergedCourses);
}
