<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-8 text-gray-900 dark:text-white">项目统计分析</h1>

    <!-- 顶部卡片统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in topStats" :key="stat.title" 
           class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ stat.title }}</h3>
        <div class="flex items-end justify-between">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {{ stat.value }}
          </div>
          <div :class="['text-sm', stat.trend > 0 ? 'text-green-500' : 'text-red-500']">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </div>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
          较上月{{ stat.trend > 0 ? '增长' : '下降' }}
        </div>
      </div>
    </div>

    <!-- 项目进展和任务完成情况 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 项目状态分布 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">项目状态分布</h3>
        <div class="h-80" ref="projectStatusChart"></div>
      </div>

      <!-- 任务完成趋势 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">任务完成趋势</h3>
        <div class="h-80" ref="taskCompletionChart"></div>
      </div>
    </div>

    <!-- 项目类型分析和成果产出 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 项目类型分布 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">项目类型分布</h3>
        <div class="h-80" ref="projectTypeChart"></div>
      </div>

      <!-- 成果产出统计 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">成果产出统计</h3>
        <div class="h-80" ref="outputChart"></div>
      </div>
    </div>

    <!-- 时间轴展示 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">项目时间轴分析</h3>
      <div class="h-96" ref="timelineChart"></div>
    </div>

    <!-- 项目经费分析 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 经费使用趋势 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">经费使用趋势</h3>
        <div class="h-80" ref="budgetTrendChart"></div>
      </div>

      <!-- 经费分配分析 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">经费分配分析</h3>
        <div class="h-80" ref="budgetAllocationChart"></div>
      </div>
    </div>

    <!-- 参与单位分析 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">参与单位协作网络</h3>
      <div class="h-96" ref="organizationNetworkChart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import api from '@/utils/api'

// 图表引用
const projectStatusChart = ref(null)
const taskCompletionChart = ref(null)
const projectTypeChart = ref(null)
const outputChart = ref(null)
const timelineChart = ref(null)
const budgetTrendChart = ref(null)
const budgetAllocationChart = ref(null)
const organizationNetworkChart = ref(null)

// 顶部统计数据
const topStats = ref([
  { title: '进行中的项目', value: 0, trend: 0 },
  { title: '本月完成任务', value: 0, trend: 0 },
  { title: '产出成果总数', value: 0, trend: 0 },
  { title: '参与单位数量', value: 0, trend: 0 }
])

// 初始化所有图表
const initCharts = async () => {
  try {
    const [
      projectStats,
      taskStats,
      outputStats,
      timelineData,
      budgetStats,
      organizationStats
    ] = await Promise.all([
      api.get('/statistics/projects'),
      api.get('/statistics/tasks'),
      api.get('/statistics/outputs'),
      api.get('/statistics/timeline'),
      api.get('/statistics/budget'),
      api.get('/statistics/organizations')
    ])

    // 更新顶部统计数据
    updateTopStats(projectStats.data)

    // 初始化各个图表
    initProjectStatusChart(projectStats.data)
    initTaskCompletionChart(taskStats.data)
    initProjectTypeChart(projectStats.data)
    initOutputChart(outputStats.data)
    initTimelineChart(timelineData.data)
    initBudgetTrendChart(budgetStats.data)
    initBudgetAllocationChart(budgetStats.data)
    initOrganizationNetworkChart(organizationStats.data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 更新顶部统计数据
const updateTopStats = (data) => {
  topStats.value = [
    {
      title: '进行中的项目',
      value: data.activeProjects,
      trend: data.activeProjectsTrend
    },
    {
      title: '本月完成任务',
      value: data.completedTasks,
      trend: data.completedTasksTrend
    },
    {
      title: '产出成果总数',
      value: data.totalOutputs,
      trend: data.outputsTrend
    },
    {
      title: '参与单位数量',
      value: data.organizationCount,
      trend: data.organizationTrend
    }
  ]
}

// 初始化项目状态分布图表
const initProjectStatusChart = (data) => {
  const chart = echarts.init(projectStatusChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '项目状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: data.statusDistribution.ongoing, name: '进行中' },
          { value: data.statusDistribution.completed, name: '已完成' },
          { value: data.statusDistribution.delayed, name: '已延期' },
          { value: data.statusDistribution.pending, name: '未开始' }
        ]
      }
    ]
  })
}

// 初始化任务完成趋势图表
const initTaskCompletionChart = (data) => {
  const chart = echarts.init(taskCompletionChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划完成', '实际完成']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.timeline
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '计划完成',
        type: 'line',
        data: data.planned,
        smooth: true,
        lineStyle: {
          width: 0
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(128, 255, 165)'
            },
            {
              offset: 1,
              color: 'rgb(1, 191, 236)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        }
      },
      {
        name: '实际完成',
        type: 'line',
        data: data.actual,
        smooth: true,
        lineStyle: {
          width: 0
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 191, 0)'
            },
            {
              offset: 1,
              color: 'rgb(224, 62, 76)'
            }
          ])
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  })
}

// 初始化项目类型分布图表
const initProjectTypeChart = (data) => {
  const chart = echarts.init(projectTypeChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '项目类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(data.typeDistribution).map(([name, value]) => ({
          name,
          value
        }))
      }
    ]
  })
}

// 初始化成果产出统计图表
const initOutputChart = (data) => {
  const chart = echarts.init(outputChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['已完成', '进行中', '计划中']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['论文', '专利', '软件著作权', '技术报告', '标准规范']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: data.completed
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: data.ongoing
      },
      {
        name: '计划中',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: data.planned
      }
    ]
  })
}

// 初始化时间轴图表
const initTimelineChart = (data) => {
  const chart = echarts.init(timelineChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['立项', '中期', '结项']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '立项',
        type: 'scatter',
        symbolSize: 20,
        data: data.startPoints
      },
      {
        name: '中期',
        type: 'scatter',
        symbolSize: 20,
        data: data.midPoints
      },
      {
        name: '结项',
        type: 'scatter',
        symbolSize: 20,
        data: data.endPoints
      }
    ]
  })
}

// 初始化经费使用趋势图表
const initBudgetTrendChart = (data) => {
  const chart = echarts.init(budgetTrendChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划使用', '实际使用']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.timeline
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 万'
      }
    },
    series: [
      {
        name: '计划使用',
        type: 'line',
        data: data.planned,
        smooth: true
      },
      {
        name: '实际使用',
        type: 'line',
        data: data.actual,
        smooth: true
      }
    ]
  })
}

// 初始化经费分配分析图表
const initBudgetAllocationChart = (data) => {
  const chart = echarts.init(budgetAllocationChart.value)
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}万元 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '经费分配',
        type: 'pie',
        radius: '50%',
        data: Object.entries(data.allocation).map(([name, value]) => ({
          name,
          value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 初始化参与单位协作网络图表
const initOrganizationNetworkChart = (data) => {
  const chart = echarts.init(organizationNetworkChart.value)
  chart.setOption({
    tooltip: {},
    legend: [
      {
        data: data.categories.map(a => a.name)
      }
    ],
    series: [
      {
        name: '协作网络',
        type: 'graph',
        layout: 'force',
        data: data.nodes,
        links: data.links,
        categories: data.categories,
        roam: true,
        label: {
          show: true,
          position: 'right'
        },
        force: {
          repulsion: 100
        }
      }
    ]
  })
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  const charts = [
    projectStatusChart,
    taskCompletionChart,
    projectTypeChart,
    outputChart,
    timelineChart,
    budgetTrendChart,
    budgetAllocationChart,
    organizationNetworkChart
  ]

  charts.forEach(chartRef => {
    if (chartRef.value) {
      const chart = echarts.getInstanceByDom(chartRef.value)
      chart?.resize()
    }
  })
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script> 