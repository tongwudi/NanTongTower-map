import Vue from 'vue'

Vue.directive('drag', (el) => {
  const headDom = el.querySelector('.dialog-header')
  headDom.onmousedown = function (e) {
    var disx = e.clientX - el.offsetLeft
    var disy = e.clientY - el.offsetTop
    document.onmousemove = function (e) {
      var x = e.clientX - disx
      var y = e.clientY - disy
      // 左贴边
      if (x <= 0) {
        x = 0
      }
      // 上贴边
      if (y <= 0) {
        y = 0
      }
      // 右贴边
      if (x >= window.innerWidth - el.offsetWidth) {
        x = window.innerWidth - el.offsetWidth
      }
      // 下贴边
      if (y >= window.innerHeight - el.offsetHeight) {
        y = window.innerHeight - el.offsetHeight
      }
      el.style.left = x + 'px'
      el.style.top = y + 'px'
    }
    document.onmouseup = function () {
      document.onmousemove = document.onmouseup = null
    }
  }
})
