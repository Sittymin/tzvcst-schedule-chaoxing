function scheduleHtmlParser(html) {
  // 假设 html 是一个 JSON 字符串，首先将其解析为对象
  let infos = JSON.parse(html);
  // 然后调用 format 函数来处理这些信息
  infos = format(infos);
  infos = mergeConflictingCourses(infos);
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


function mergeConflictingCourses(courses) {

  // 检查两个课程是否在某一周和某一节次冲突
  function isConflict(course1, course2) {
    return  course1.day === course2.day &&
            course1.sections.some(section => course2.sections.includes(section)) &&
            course1.weeks.some(week => course2.weeks.includes(week));
  }

  // 合并冲突的课程
  function mergeCourses(course1, course2) {
    // 找出两个课程都有的周数和节次
    let commonWeeks = course1.weeks.filter(week => course2.weeks.includes(week));
    let commonSections = course1.sections.filter(section => course2.sections.includes(section));
    let uncommonSections = course1.sections.filter(section => !course2.sections.includes(section));

    // 创建合并后的课程
    let mergedCourse = [{
      name: `${course1.name}/${course2.name}`,
      position: course1.position && course2.position ? `${course1.position}/${course2.position}` : '',
      teacher: course1.teacher && course2.teacher ? `${course1.teacher}/${course2.teacher}` : '',
      weeks: commonWeeks,
      day: course1.day,
      sections: commonSections
    }];

    // 是否相等
    function is_include(course1, course2) {
      if (course1.sections === course2.sections) {
        return true;
      } else {
        return false;
      }
    }
    // 更新原课程的周数，移除与合并课程重叠的部分
    if(is_include(course1, course2)) {
      course1.weeks = course1.weeks.filter(week => !commonWeeks.includes(week));
      course2.weeks = course2.weeks.filter(week => !commonWeeks.includes(week));
    } else {
      // 如果同周不同节次，需要将不同的节次添加到原课程中
      course1.weeks = course1.weeks.filter(week => !commonWeeks.includes(week));
      course2.weeks = course2.weeks.filter(week => !commonWeeks.includes(week));
      let course_inter_weeks1 = {
        name: `${course1.name}`,
        position: `${course1.position}`,
        teacher: `${course1.teacher}`,
        weeks: commonWeeks,
        day: course1.day,
        sections: uncommonSections.filter(section => course1.sections.includes(section))
      }
      let course_inter_weeks2 = {
        name: `${course2.name}`,
        position: `${course2.position}`,
        teacher: `${course2.teacher}`,
        weeks: commonWeeks,
        day: course2.day,
        sections: uncommonSections.filter(section => course2.sections.includes(section))
      }
      // 如果sections为空，不添加
      if(course_inter_weeks1.sections.length > 0) {
        mergedCourse.push(course_inter_weeks1);
      }

      if(course_inter_weeks2.sections.length > 0) {
        mergedCourse.push(course_inter_weeks2);
      }
    }

    return mergedCourse;
  }

  let mergedCourses = [];
  let toMerge = [...courses];

  while (toMerge.length > 0) {
    let course = toMerge.shift();
    let conflictIndex = toMerge.findIndex(c => isConflict(course, c));

    if (conflictIndex !== -1) {
      // 处理冲突
      let conflictCourse = toMerge[conflictIndex];
      let mergedCourse = mergeCourses(course, conflictCourse);

      // 只有在课程依然有剩余周数时才将其添加回列表
      if (course.weeks.length > 0) mergedCourses.push(course);
      if (conflictCourse.weeks.length > 0) mergedCourses.push(conflictCourse);

      // 添加合并后的课程
      mergedCourses = mergedCourses.concat(mergedCourse);

      // 移除已处理的冲突课程
      toMerge.splice(conflictIndex, 1);
    } else {
      // 无冲突，直接添加
      mergedCourses.push(course);
    }
  }

  return mergedCourses;
}