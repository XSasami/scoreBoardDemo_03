// 获取DOM元素
var scB = document.querySelector(".scB"); // 计分板外壳
var scB_con = document.querySelector(".scB_con"); // 计分板内容
var setG_btn = document.querySelector(".setG_btn"); // 立即分组按钮
var scB_mask = document.querySelector(".scB_mask"); // "设置分组"的遮罩层

// 声明全局变量
var count_dis = null; // 组数显示器
var groupsCount = null; // 组数

var flag = null; // 开关
var mouseX = null; // 鼠标在计分板内的横坐标
var mouseY = null; // 鼠标在计分板内的纵坐标

// 注册mousedown事件，按下鼠标时打开开关，并获取鼠标在计分板内的坐标
scB.addEventListener('mousedown', scB_catchScB);
// 注册mousemove事件，移动鼠标时，计分板跟随移动
document.addEventListener('mousemove', scB_moveScB);
// 注册mouseup事件，弹起鼠标时，关闭开关，并初始化变量
document.addEventListener('mouseup', scB_movedReset);

function scB_catchScB(e) {
  if(e.target) {
    flag = true;
    // 获取鼠标在计分板内的距离
    mouseX = e.pageX - scB.offsetLeft;
    mouseY = e.pageY - scB.offsetTop;
  }
}

function scB_moveScB(e) {
  if(flag) {
    scB.style.left = (e.pageX - mouseX) + 'px';
    scB.style.top = (e.pageY - mouseY) + 'px';
  }
}

function scB_movedReset() {
  flag = null;
  mouseX = null;
  mouseY = null;
}

// 使用行内注册点击事件！
// 点击setG_btn之后，显示scB_mask
function scB_showEle(ele) {
  ele.classList.remove("hide");
}

// 点击计分板的关闭按钮之后，移除计分板
function scB_removeScB(ele) {
  var scB = ele.parentNode;
  document.body.removeChild(scB);
}

// 点击"设置分组"里的关闭按钮之后，隐藏scB_mask
function scB_hideEle(ele) {
  ele.classList.add("hide");
}

// 点击"设置分组"里的 +/- 按钮之后，修改组数显示框里的组数
function scB_sgsSetCounts(ele) {
  // 判断groupsCount是否已经在组数显示器中获取了组数
  if (!groupsCount) {
    count_dis = document.querySelector(".count_dis");
    groupsCount = Number(count_dis.innerHTML);
  }
  // 判断点击的是 "+" 按钮 还是 "-" 按钮
  if (ele.innerHTML == "-") {
    if (groupsCount === 1) return;
    groupsCount--;
  } else if (ele.innerHTML == "+") {
    if (groupsCount === 15) return;
    groupsCount++;
  }
  // 为 组数显示器 赋值
  count_dis.innerHTML = groupsCount;
}

// 点击"设置分组"里的开始分组按钮之后，开始分组操作
function scB_sgsBeginGrouping() {
  // 获取组数，默认为1
  var count = groupsCount || 1;

  var scB_groups = document.querySelector(".scB_groups"); // 获取分组容器
  var scB_group = scB_groups.firstElementChild; // 获取"第一组"

  scB_showEle(scB_group); // 显示"第一组"

  // 循环生成分组(li标签)，因为早已存在"第一组"，所以 要生成的分组数 = 组数 - 1
  for (var i = 1; i < count; i++) {
    // 以"第一组"为模板，深度克隆出新的分组并添加到分组容器中
    scB_groups.appendChild(scB_group.cloneNode(true));
  }

  // 判断所有分组的总宽度是否超出计分板内容scB_con的宽度，若是，则把scB_con宽度改为 auto
  /**
   * 这里有个坑，由于offsetWidth会把结果四舍五入，
   * 所以当我们生成3个分组时，每个分组宽为166.67，四舍五入后结果为167，
   * 因此分组总宽度为501大于scB_con的宽度500，这时候把width改为 auto 就会有问题。
   * 因为offsetWidth已经取整了，我们无法再做取整操作，因此 -1 。
   * 
   * 当然，用组数作为判断条件也是可以的，大于五组就把宽度改为auto，
   * 只是不灵活，如果以后scB_con的宽度能容纳六组呢？
   */
  if ((scB_group.offsetWidth - 1) * count > scB_con.offsetWidth)
    scB_con.style.width = "auto";

  // 隐藏 立即分组按钮 和 遮罩层
  scB_hideEle(setG_btn);
  scB_hideEle(scB_mask);

  // 初始化全局变量
  count_dis = null; // 组数显示器
  groupsCount = null; // 组数
}

// 点击加分按钮，非零分时隐藏灰旗，分数递增并逐一添加红旗
function scB_addScore(ele) {
  // 为了保证分数的独立性，通过自定义属性把分数绑到各自的分组（li）上
  if (!ele.parentNode.score) {
    ele.parentNode.score = Number(ele.previousElementSibling.innerHTML);
  }
  // 当分数为零时，隐藏灰旗
  if (ele.parentNode.score == 0)
    ele.parentNode.children[2].firstElementChild.classList.add("hide");
  // 分数递增
  ele.parentNode.score++;
  ele.previousElementSibling.innerHTML = ele.parentNode.score;
  // 添加红旗
  ele.parentNode.children[2].appendChild(document.createElement("span"));
  
  // 判断红旗一列的长度是否大于红旗容器的高度，若是，则把分组容器的 height 改为 auto
  // if(ele.parentNode.children[2].scrollHeight > ele.parentNode.children[2].offsetHeight)
  //   ele.parentNode.parentNode.style.height = 'auto';
}

// 点击减分按钮，逐一移除红旗，分数递减并且零分时显示灰旗
function scB_subScore(ele) {
  // 为了保证分数的独立性，通过自定义属性把分数绑到各自的分组（li）上
  if (!ele.parentNode.score) {
    ele.parentNode.score = Number(
      ele.nextElementSibling.nextElementSibling.innerHTML
    );
  }
  if (ele.parentNode.score == 0) return; // 零分时直接返回

  // 移除红旗
  ele.nextElementSibling.removeChild(ele.nextElementSibling.lastElementChild);

  // 分数递减
  ele.parentNode.score--;
  ele.nextElementSibling.nextElementSibling.innerHTML = ele.parentNode.score;

  // 零分时显示灰旗
  if (ele.parentNode.score == 0)
    ele.nextElementSibling.lastElementChild.classList.remove("hide");
}