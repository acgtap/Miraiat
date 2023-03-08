<template>
  <div>{{ time }}</div>
</template>

<script>
// import { beautifyTime } from '@/utils/functions'

export default {
  components: {},
  props: {
    value: {
      type: String,
    },
  },
  watch: {
    value() {
      this.setTime()
    },
  },
  data() {
    return {
      time: '',
      timeout: null,
    }
  },
  created() {
    this.setTime()
  },
  unmounted() {
    clearInterval(this.timeout)
  },
  methods: {
    beautifyTime(datetime = '') {
  if (datetime == null) {
    return ''
  }



  let time = new Date()
  let outTime = new Date(datetime)
  if (/^[1-9]\d*$/.test(datetime)) {
    outTime = new Date(parseInt(datetime))
  }

  if (time.getTime() < outTime.getTime()) {
    return this.parseTime(outTime, '{y}/{m}/{d}')
  }

  if (time.getFullYear() != outTime.getFullYear()) {
    return this.parseTime(outTime, '{y}/{m}/{d}')
  }

  if (time.getMonth() != outTime.getMonth()) {
    return this.parseTime(outTime, '{m}/{d}')
  }

  if (time.getDate() != outTime.getDate()) {
    let day = outTime.getDate() - time.getDate()
    if (day == -1) {
      return this.parseTime(outTime, '昨天 {h}:{i}')
    }

    if (day == -2) {
      return this.parseTime(outTime, '前天 {h}:{i}')
    }

    return this.parseTime(outTime, '{m}-{d}')
  }

  if (time.getHours() != outTime.getHours()) {
    return this.parseTime(outTime, '{h}:{i}')
  }

  let minutes = outTime.getMinutes() - time.getMinutes()
  if (minutes == 0) {
    return '刚刚'
  }

  minutes = Math.abs(minutes)
  return `${minutes}分钟前`
}
,parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }

  let date
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'

  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }

    date = new Date(time.replace(/-/g, '/'))
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }

  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }

    return value.toString().padStart(2, '0')
  })

  return time_str
},
    setTime() {
      this.time = this.beautifyTime(this.value)

      let time = new Date().getTime()
      let inTime = new Date(this.value).getTime()

      clearInterval(this.timeout)

      if (time - inTime > 35 * 60 * 1000) {
        return
      }

      this.timeout = setTimeout(() => {
        this.setTime()
      }, 60 * 1000)
    },
  },
}
</script>
