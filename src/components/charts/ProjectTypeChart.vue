<template>
  <div class="h-full">
    <div v-if="chartError" class="h-full flex items-center justify-center">
      <p class="text-gray-500 dark:text-gray-400">加载图表时出错</p>
    </div>
    <pie-chart
      v-else
      :chart-data="processedChartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Pie as PieChart } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

// 错误状态
const chartError = ref(false);

// 安全地处理图表数据
const processedChartData = computed(() => {
  try {
    // 确保有效数据
    if (!props.chartData || Object.keys(props.chartData).length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }

    const labels = Object.keys(props.chartData);
    const data = Object.values(props.chartData);

    // 生成颜色
    const colors = labels.map((_, index) => {
      const hue = (index * 137) % 360; // 使用黄金角分布颜色
      return `hsla(${hue}, 70%, 60%, 0.8)`;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("Error processing chart data:", error);
    chartError.value = true;
    // 返回有效的空数据结构
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderWidth: 1
      }]
    };
  }
});

// 图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        // 根据当前主题设置颜色
        color: document.documentElement.classList.contains("dark")
          ? "#d1d5db"
          : "#374151",
      },
    },
  },
};

// 确保组件挂载时不会出错
onMounted(() => {
  try {
    // 验证数据有效性
    if (!processedChartData.value || 
        !processedChartData.value.labels || 
        !processedChartData.value.datasets) {
      chartError.value = true;
    }
  } catch (error) {
    console.error("Error mounting chart component:", error);
    chartError.value = true;
  }
});
</script> 