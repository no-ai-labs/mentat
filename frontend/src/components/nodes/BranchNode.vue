<template>
  <div class="branch-node">
    <Handle type="target" position="left" />
    
    <div class="node-header">
      <div class="node-icon">🔀</div>
      <div class="node-title">Branch</div>
    </div>
    
    <div class="node-content">
      <div class="input-group">
        <label>Condition:</label>
        <textarea 
          v-model="localData.condition"
          @input="updateData"
          placeholder="Enter branching condition..."
          rows="2"
        />
      </div>
      
      <div class="branch-info">
        <span class="branch-count">{{ branchCount }} branches</span>
      </div>
    </div>
    
    <!-- Multiple output handles for branching -->
    <Handle 
      v-for="(branch, index) in branches" 
      :key="index"
      :id="`branch-${index}`"
      type="source" 
      position="right"
      :style="{ top: `${30 + index * 20}px` }"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Handle } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      condition: 'if condition',
      branches: ['true', 'false']
    })
  }
})

const emit = defineEmits(['update:data'])

const localData = reactive({
  condition: props.data.condition || 'if condition',
  branches: props.data.branches || ['true', 'false']
})

const branches = computed(() => localData.branches)
const branchCount = computed(() => branches.value.length)

const updateData = () => {
  emit('update:data', { ...localData })
}

// Watch for external data changes
watch(() => props.data, (newData) => {
  if (newData) {
    localData.condition = newData.condition || 'if condition'
    localData.branches = newData.branches || ['true', 'false']
  }
}, { deep: true })
</script>

<style scoped>
.branch-node {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.node-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 8px;
}

.node-title {
  font-weight: 600;
  color: #92400e;
  font-size: 16px;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
}

.input-group textarea {
  padding: 8px;
  border: 1px solid #d97706;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 50px;
  background: rgba(255, 255, 255, 0.8);
}

.input-group textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.branch-info {
  text-align: center;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
}

.branch-count {
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
}
</style> 