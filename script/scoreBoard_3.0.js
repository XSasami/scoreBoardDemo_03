(function (window) {
  var zIndex = 100; // 把层数放在全局共用

  function scoreBoard() {
    // 判断页面中是否存在id名为scB_container的盒子
    if (document.getElementById("scB_container")) {
      // 获取父盒子
      var scB_container = document.getElementById("scB_container");
      // 为父盒子添加相对定位
      scB_container.style.position = "relative";
      // 隐藏超出父盒子的部分
      scB_container.style.overflow = "hidden";
    } else {
      console.log("创建计分板需要一个id为scB_container的盒子");
      return;
    }

    // 创建构造函数，构造计分板
    function ScoreBoard(eleObj, valObj) {
      for (var i = 0; i < arguments.length; i++) {
        for (var k in arguments[i]) {
          if (this.hasOwnProperty(k)) {
            continue;
          } else {
            this[k] = arguments[i][k];
          }
        }
      }
    }
    // 把方法方法放在原型上
    ScoreBoard.prototype = {
      // 阻止冒泡
      scB_stopBubble: function (e) {
        e.stopPropagation();
      },
      // 移除计分板
      scB_removeScB: function (ele) {
        scB_container.removeChild(ele);
      },
      // 显示元素
      scB_showEle: function (ele) {
        ele.classList.remove("hide");
      },
      // 隐藏元素
      scB_hideEle: function (ele) {
        ele.classList.add("hide");
      },
      // 减少分组数
      scB_sgsSubCounts: function () {
        // 判断groupsCount是否已经在组数显示器中获取了组数
        if (!this.groupsCount) {
          this.groupsCount = Number(this.count_dis.innerHTML);
        }
        // 判断组数是否最小值
        if (this.groupsCount <= 1) return;
        this.groupsCount--;
        // 为 组数显示器 赋值
        this.count_dis.innerHTML = this.groupsCount;
      },
      // 增加分组数
      scB_sgsAddCounts: function () {
        // 判断groupsCount是否已经在组数显示器中获取了组数
        if (!this.groupsCount) {
          this.groupsCount = Number(this.count_dis.innerHTML);
        }
        // 判断组数是否最大值
        if (this.groupsCount >= 15) return;
        this.groupsCount++;
        // 为 组数显示器 赋值
        this.count_dis.innerHTML = this.groupsCount;
      },
      // 开始分组操作
      scB_sgsBeginGrouping: function () {
        // 获取组数，默认为1
        var count = this.groupsCount || 1;
        // 新分组临时储存器
        var newGroup = null;

        var scB_group = this.scB_groups.firstElementChild; // 获取"第一组"
        scB_group.children[1].addEventListener("mousedown", this.scB_stopBubble);
        scB_group.children[4].addEventListener("mousedown", this.scB_stopBubble);

        this.scB_showEle(scB_group); // 显示"第一组"

        // 循环生成分组(li标签)，因为早已存在"第一组"，所以 要生成的分组数 = 组数 - 1
        for (var i = 1; i < count; i++) {
          // 以"第一组"为模板，深度克隆出新的分组添加到分组容器中并为它的两个按钮注册点击事件
          newGroup = scB_group.cloneNode(true);
          this.scB_groups.appendChild(newGroup);
          newGroup.children[1].addEventListener("mousedown", this.scB_stopBubble);
          newGroup.children[4].addEventListener("mousedown", this.scB_stopBubble);
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
        if ((scB_group.offsetWidth - 1) * count > this.scB_con.offsetWidth)
          this.scB_con.style.width = "auto";

        // 隐藏 立即分组按钮 和 遮罩层
        this.scB_hideEle(this.setG_btn);
        this.scB_hideEle(this.scB_mask);

        // 初始化全局变量
        this.groupsCount = null; // 组数
      },
      // 点击加分按钮，非零分时隐藏灰旗，分数递增并逐一添加红旗
      // 点击减分按钮，逐一移除红旗，分数递减并且零分时显示灰旗
      scB_setScore: function (e) {
        if (e.target.className.indexOf('group_addBtn') != -1) {
          // 为了保证分数的独立性，通过自定义属性把分数绑到各自的分组（li）上
          if (!e.target.parentNode.score) {
            e.target.parentNode.score = Number(e.target.previousElementSibling.innerHTML);
          }
          // 当分数为零时，隐藏灰旗
          if (e.target.parentNode.score == 0)
            e.target.parentNode.children[2].firstElementChild.classList.add("hide");
          // 分数递增
          e.target.parentNode.score++;
          e.target.previousElementSibling.innerHTML = e.target.parentNode.score;
          // 添加红旗
          e.target.parentNode.children[2].appendChild(document.createElement("span"));
        } else if (e.target.className.indexOf('group_subBtn') != -1) {
          // 为了保证分数的独立性，通过自定义属性把分数绑到各自的分组（li）上
          if (!e.target.parentNode.score) {
            e.target.parentNode.score = Number(
              e.target.nextElementSibling.nextElementSibling.innerHTML
            );
          }
          if (e.target.parentNode.score == 0) return; // 零分时直接返回

          // 移除红旗
          e.target.nextElementSibling.removeChild(
            e.target.nextElementSibling.lastElementChild
          );

          // 分数递减
          e.target.parentNode.score--;
          e.target.nextElementSibling.nextElementSibling.innerHTML = e.target.parentNode.score;

          // 零分时显示灰旗
          if (e.target.parentNode.score == 0)
            e.target.nextElementSibling.lastElementChild.classList.remove("hide");
        }
      },
      // 把计分板置顶，获取鼠标在计分板内的位置，并且打开开关
      scB_catchScB: function (e) {
        zIndex++;
        this.scB.style.zIndex = zIndex;
        this.flag = true;
        this.mouseX = e.pageX - this.scB.offsetLeft;
        this.mouseY = e.pageY - this.scB.offsetTop;
      },
      // 移动计分板
      scB_moveScB: function (e) {
        if (this.flag) {
          this.scB.style.left = e.pageX - this.mouseX + "px";
          this.scB.style.top = e.pageY - this.mouseY + "px";
        }
      },
      // 初始化拖动计分板而用到的变量
      scB_reset: function () {
        this.flag = null;
        this.mouseX = null;
        this.mouseY = null;
      }
    };

    // 封装创建元素的方法
    function cEle(ele) {
      return document.createElement(ele);
    }

    /**
     * 创建计分板 
     * 返回一个储存 需要操作的元素 的对象，每个元素的类名与对应属性一致
     */
    function createScB() {
      // 创建 计分板外壳
      var scB = cEle("div");
      scB.classList.add("scB", "bc");
      scB.innerHTML = `<span class="scB_close iconfont icon-close"></span>`;

      // 创建 "设置分组"的遮罩层
      var scB_mask = cEle("div");
      scB_mask.classList.add("scB_mask", "hide");
      scB_mask.innerHTML = `<div class="setGroups">
              <div class="sgs_close iconfont icon-close"></div>
              <div class="sgs_tit">分&nbsp;&nbsp;&nbsp;组</div>
              <div class="sgs_con">
                  <span class="sgs_beginBtn">开始分组</span>
                  <div class="sgs_show">
                      <p>将全班同学分为</p>
                      <p>组</p>
                  </div>
              </div>
              </div>`;
      scB.appendChild(scB_mask);

      // 设置组数的容器
      var set_count_box = cEle("div");
      set_count_box.classList.add("set_count_box");
      set_count_box.innerHTML = `<div class="sgs_subBtn">-</div>
          <div class="count_dis">1</div>
          <div class="sgs_addBtn">+</div>`;
      scB_mask.firstElementChild.lastElementChild.lastElementChild.insertBefore(
        set_count_box,
        scB_mask.firstElementChild.lastElementChild.lastElementChild
        .lastElementChild
      );

      // 创建 计分板内容
      var scB_con = cEle("div");
      scB_con.classList.add("scB_con");
      scB_con.innerHTML = `<div class="scB_tit hc">计分板</div>
          <ul class="scB_groups">
              <li class="scB_group hide">
                  <h3 class="group_tit"> 组</h3>
                  <div class="group_subBtn iconfont icon-jian-xianxingyuankuang"></div>
                  <div class="flag_ves">
                      <div class="flag_gray"></div>
                  </div>
                  <div class="score_dis">0</div>
                  <div class="group_addBtn">+</div>
              </li>
          </ul>`;
      scB.appendChild(scB_con);

      // 创建 计分板按钮
      var setG_btn = cEle("span");
      setG_btn.classList.add("setG_btn", "hc");
      setG_btn.innerHTML = "立即分组";
      scB_con.appendChild(setG_btn);

      // 把 计分板 插进容器
      scB_container.appendChild(scB);

      return {
        scB: scB, // "计分板"外壳
        scB_con: scB_con, // "计分板"内容
        setG_btn: setG_btn, // "计分板"设置分组按钮
        scB_mask: scB_mask, // "设置分组"的遮罩层
        scB_close: scB.firstElementChild, // "计分板"的关闭按钮
        sgs_close: scB_mask.firstElementChild.firstElementChild, // "设置分组"的关闭按钮
        sgs_subBtn: set_count_box.children[0], // 减小组数按钮
        count_dis: set_count_box.children[1], // 组数显示器
        sgs_addBtn: set_count_box.children[2], // 增加组数按钮
        sgs_beginBtn: set_count_box.parentNode.previousElementSibling, // 开始分组按钮
        scB_groups: scB_con.children[1] // 分组容器
      };
    }

    // 获取要操作的元素
    var eleObj = createScB();
    // 获取全局变量
    var varObj = {
      groupsCount: null, // 组数
      flag: null, // 开关
      mouseX: null, // 鼠标在计分板内的横坐标
      mouseY: null // 鼠标在计分板内的纵坐标
    };

    // 实例化计分板对象
    var s = new ScoreBoard(eleObj, varObj);
    // console.log(s);

    // 注册点击事件
    s.setG_btn.addEventListener("click", function () {
      s.scB_showEle(s.scB_mask);
    });
    s.setG_btn.addEventListener("mousedown", s.scB_stopBubble);

    s.sgs_close.addEventListener("click", function () {
      s.scB_hideEle(s.scB_mask);
    });
    s.sgs_close.addEventListener("mousedown", s.scB_stopBubble);

    s.scB_close.addEventListener("click", function () {
      s.scB_removeScB(s.scB);
    });
    s.scB_close.addEventListener("mousedown", s.scB_stopBubble);

    s.sgs_subBtn.addEventListener("click", function () {
      s.scB_sgsSubCounts();
    });
    s.sgs_subBtn.addEventListener("mousedown", s.scB_stopBubble);

    s.sgs_addBtn.addEventListener("click", function () {
      s.scB_sgsAddCounts();
    });
    s.sgs_addBtn.addEventListener("mousedown", s.scB_stopBubble);

    s.sgs_beginBtn.addEventListener("click", function () {
      s.scB_sgsBeginGrouping();
    });
    s.sgs_beginBtn.addEventListener("mousedown", s.scB_stopBubble);

    s.scB_groups.addEventListener('click', s.scB_setScore)

    // -----------------拖动计分板-----------------
    s.scB.addEventListener("mousedown", function (e) {
      s.scB_catchScB(e);
    });
    document.addEventListener("mousemove", function (e) {
      s.scB_moveScB(e);
    });
    document.addEventListener("mouseup", function (e) {
      s.scB_reset();
    });
  }

  window.scoreBoard = scoreBoard;
})(window);