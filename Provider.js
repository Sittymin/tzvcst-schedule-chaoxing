async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    //登录时的用户名
    let element = dom.querySelector('[name="username"]');
    //具体课表位置
    const path = '/admin/pkgl/xskb/queryKbForXsd';

    //调用小爱课程表
    await loadTool('AIScheduleTools');
    // 使用 fetch API 获取 path 路径的内容，然后将返回转换为文本后再转换为 HTML 文档
    const contentDom = await fetch(path).then(res => res.text()).then(text => new DOMParser().parseFromString(text, 'text/html'));
    // 从转换后的 HTML 文档中获取 xhid 和 xqdm 的值,还有遍历 xnxq 的 option 放入 arr
    const xhid = contentDom.querySelector('#xhid').value;
    const xqdm = contentDom.querySelector('#xqdm').value;
    const arr = [];
    for (let option of contentDom.querySelectorAll('#xnxq1>option')) {
        const value = option.value;
        if (value) {
            arr.push(value);
        }
    }
    //显示选择列表
    const xnxq = await AIScheduleSelect({
        contentText: '请选择学年学期',
        selectList: arr,
    });

    //清理标签与最终返回部分
    //获取课表具体数据
    return fetch('/admin/pkgl/xskb/sdpkkbList?' + new URLSearchParams({
        xnxq,
        xhid,
        xqdm,
    }))
    //处理返回数据
        .then(res => res.text())
        .then(text => JSON.parse(text))
        .then(data => data.map(info => {
            return {
                name: cleanTag(info.kcmc),                  //课程名称
                teacher: cleanTag(info.tmc),                //教师名称
                position: cleanTag(info.croommc),           //上课地点
                sections: info.djc,                         //节次
                weeks: info.zcstr.split(",").map(Number),   //上课周数(分割并转换为数组)
                day: info.xingqi,                           //星期
            };
        }))
        //最终转换为JSON
        .then(data => JSON.stringify(data));
}

//去除HTML标签
function cleanTag(str) {
    return new DOMParser().parseFromString(str, 'text/html').body.textContent.trim();
}
