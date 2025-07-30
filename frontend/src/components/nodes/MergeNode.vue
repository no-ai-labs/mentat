<template>
  <div class="merge-node">
    <!-- Multiple input handles for merging -->
    <Handle 
      v-for="(input, index) in inputs" 
      :key="index"
      :id="`input-${index}`"
      type="target" 
      position="left"
      :style="{ top: `${30 + index * 20}px` }"
    />
    
    <div class="node-header">
      <div class="node-icon">🔀</div>
      <div class="node-title">Merge</div>
    </div>
    
    <div class="node-content">
      <div class="input-group">
        <label>Merge Strategy:</label>
        <select 
          v-model="localData.strategy"
          @change="updateData"
        >
          <option value="combine">Combine All</option>
          <option value="summarize">Summarize</option>
          <option value="prioritize">Prioritize First</option>
          <option value="aggregate">Aggregate Results</option>
        </select>
      </div>
      
      <div class="input-group">
        <label>Description:</label>
        <textarea 
          v-model="localData.description"
          @input="updateData"
          placeholder="Describe merge logic..."
          rows="2"
        />
      </div>
      
      <div class="merge-info">
        <span class="input-count">{{ inputCount }} inputs</span>
      </div>
    </div>
    
    <Handle type="source" position="right" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Handle } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      strategy: 'combine',
      description: 'Merge multiple inputs',
      inputs: ['input1', 'input2']
    })
  }
})

const emit = defineEmits(['update:data'])

const localData = reactive({
  strategy: props.data.strategy || 'combine',
  description: props.data.description || 'Merge multiple inputs',
  inputs: props.data.inputs || ['input1', 'input2']
})

const inputs = computed(() => localData.inputs)
const inputCount = computed(() => inputs.value.length)

const updateData = () => {
  emit('update:data', { ...localData })
}

// Watch for external data changes
watch(() => props.data, (newData) => {
  if (newData) {
    localData.strategy = newData.strategy || 'combine'
    localData.description = newData.description || 'Merge multiple inputs'
    localData.inputs = newData.inputs || ['input1', 'input2']
  }
}, { deep: true })
</script>

<style scoped>
.merge-node {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border: 2px solid #6366f1;
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
  background: rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  transform: scaleX(-1); /* Flip horizontally for merge icon */
}

.node-title {
  font-weight: 600;
  color: #4338ca;
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
  color: #4338ca;
}

.input-group select,
.input-group textarea {
  padding: 8px;
  border: 1px solid #6366f1;
  border-radius: 6px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
}

.input-group textarea {
  resize: vertical;
  min-height: 50px;
}

.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.merge-info {
  text-align: center;
  padding: 8px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 6px;
}

.input-count {
  font-size: 12px;
  font-weight: 500;
  color: #4338ca;
}
</style> 