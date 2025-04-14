<template>
  <div class="statistics-container">
    <!-- 顶部卡片统计 -->
    <el-row :gutter="20" class="mb-8">
      <el-col :span="6" v-for="stat in topStats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-header">
              <span class="stat-title">{{ stat.title }}</span>
              <el-tag :type="stat.trend > 0 ? 'success' : 'danger'" size="small">
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
              </el-tag>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-footer">
              较上月{{ stat.trend > 0 ? '增长' : '下降' }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>项目状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="projectStatusChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务完成趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="taskCompletionChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-5">
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>成果产出统计</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="outputChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>经费使用情况</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="budgetChart" style="height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-5">
      <el-col :span="24">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>项目时间轴</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="timelineChart" style="height: 400px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-5">
      <el-col :span="24">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>组织协作网络</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="networkChart" style="height: 600px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  getProjectStatistics,
  getTaskStatistics,
  getOutputStatistics,
  getTimelineData,
  getBudgetStatistics,
  getOrganizationNetwork
} from '@/api/statistics'

export default {
  name: 'Statistics',
  setup() {
    const projectStatusChart = ref(null)
    const taskCompletionChart = ref(null)
    const outputChart = ref(null)
    const budgetChart = ref(null)
    const timelineChart = ref(null)
    const networkChart = ref(null)

    const topStats = ref([
      { title: '进行中的项目', value: 0, trend: 0 },
      { title: '本月完成任务', value: 0, trend: 0 },
      { title: '产出成果总数', value: 0, trend: 0 },
      { title: '参与单位数量', value: 0, trend: 0 }
    ])

    let charts = []

    const initCharts = () => {
      charts = [
        echarts.init(projectStatusChart.value),
        echarts.init(taskCompletionChart.value),
        echarts.init(outputChart.value),
        echarts.init(budgetChart.value),
        echarts.init(timelineChart.value),
        echarts.init(networkChart.value)
      ]
    }

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
          value: data.totalOutputs || 0,
          trend: data.outputsTrend || 0
        },
        {
          title: '参与单位数量',
          value: data.organizationCount || 0,
          trend: data.organizationTrend || 0
        }
      ]
    }

    const loadProjectStats = async () => {
      try {
        const data = await getProjectStatistics()
        updateTopStats(data)
        
        charts[0].setOption({
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
                show: false
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
      } catch (error) {
        console.error('Failed to load project statistics:', error)
      }
    }

    const loadTaskStats = async () => {
      try {
        const data = await getTaskStatistics()
        charts[1].setOption({
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
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgb(128, 255, 165)' },
                  { offset: 1, color: 'rgb(1, 191, 236)' }
                ])
              }
            },
            {
              name: '实际完成',
              type: 'line',
              data: data.actual,
              smooth: true,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgb(255, 191, 0)' },
                  { offset: 1, color: 'rgb(224, 62, 76)' }
                ])
              }
            }
          ]
        })
      } catch (error) {
        console.error('Failed to load task statistics:', error)
      }
    }

    const loadOutputStats = async () => {
      try {
        const data = await getOutputStatistics()
        charts[2].setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
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
          xAxis: [{ type: 'category', data: ['论文', '专利', '软件著作权', '技术报告', '标准规范'] }],
          yAxis: [{ type: 'value' }],
          series: [
            {
              name: '已完成',
              type: 'bar',
              stack: 'total',
              emphasis: { focus: 'series' },
              data: data.completed
            },
            {
              name: '进行中',
              type: 'bar',
              stack: 'total',
              emphasis: { focus: 'series' },
              data: data.ongoing
            },
            {
              name: '计划中',
              type: 'bar',
              stack: 'total',
              emphasis: { focus: 'series' },
              data: data.planned
            }
          ]
        })
      } catch (error) {
        console.error('Failed to load output statistics:', error)
      }
    }

    const loadBudgetStats = async () => {
      try {
        const data = await getBudgetStatistics()
        charts[3].setOption({
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
              smooth: true,
              areaStyle: {
                opacity: 0.4
              }
            },
            {
              name: '实际使用',
              type: 'line',
              data: data.actual,
              smooth: true,
              areaStyle: {
                opacity: 0.4
              }
            }
          ]
        })
      } catch (error) {
        console.error('Failed to load budget statistics:', error)
      }
    }

    const loadTimelineData = async () => {
      try {
        const data = await getTimelineData()
        charts[4].setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
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
          xAxis: { type: 'time' },
          yAxis: { type: 'category', data: data.projects },
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
      } catch (error) {
        console.error('Failed to load timeline data:', error)
      }
    }

    const loadNetworkData = async () => {
      try {
        const data = await getOrganizationNetwork()
        charts[5].setOption({
          tooltip: {},
          legend: [
            {
              data: data.categories.map(a => a.name)
            }
          ],
          series: [
            {
              type: 'graph',
              layout: 'force',
              animation: true,
              draggable: true,
              data: data.nodes,
              links: data.links,
              categories: data.categories,
              roam: true,
              label: {
                show: true,
                position: 'right',
                formatter: '{b}'
              },
              force: {
                repulsion: 100,
                edgeLength: 200
              },
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [4, 10],
              edgeLabel: {
                show: true,
                formatter: '{c}'
              },
              lineStyle: {
                opacity: 0.9,
                width: 2,
                curveness: 0
              }
            }
          ]
        })
      } catch (error) {
        console.error('Failed to load network data:', error)
      }
    }

    const handleResize = () => {
      charts.forEach(chart => chart?.resize())
    }

    onMounted(() => {
      initCharts()
      loadProjectStats()
      loadTaskStats()
      loadOutputStats()
      loadBudgetStats()
      loadTimelineData()
      loadNetworkData()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      charts.forEach(chart => chart?.dispose())
    })

    return {
      projectStatusChart,
      taskCompletionChart,
      outputChart,
      budgetChart,
      timelineChart,
      networkChart,
      topStats
    }
  }
}
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-5 {
  margin-top: 1.25rem;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-footer {
  font-size: 0.75rem;
  color: #999;
}

.box-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  margin-top: 1rem;
}
</style> 