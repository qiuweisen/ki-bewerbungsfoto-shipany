/**
 * AI 图片生成 API 使用示例
 * 
 * 这个文件包含了各种 AI 图片生成 API 的使用示例
 * 可以直接复制代码到你的项目中使用
 */

// ============================================================================
// 1. 基础图片生成示例
// ============================================================================

/**
 * 基础图片生成函数
 */
async function generateBasicImage(prompt, provider = 'tuzi') {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: provider,
        model: provider === 'tuzi' ? 'tuzi-general' : 'dall-e-3',
        bizNo: Date.now().toString(), // 使用时间戳作为业务号
        options: provider === 'tuzi' ? {
          aspectRatio: "1:1",
          outputFormat: "png",
          safetyTolerance: 2
        } : {
          quality: "hd",
          style: "natural"
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('生成成功:', result.data);
      return result.data.images;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('生成失败:', error.message);
    throw error;
  }
}

// 使用示例
// generateBasicImage("一只可爱的小猫在花园里玩耍", "tuzi");

// ============================================================================
// 2. 带轮询的图片生成示例
// ============================================================================

/**
 * 带轮询机制的图片生成
 */
async function generateImageWithPolling(prompt, provider = 'tuzi') {
  try {
    // 1. 发起生成请求
    const generateResponse = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        provider: provider,
        model: provider === 'tuzi' ? 'tuzi-general' : 'dall-e-3',
        bizNo: Date.now().toString(),
        options: {}
      })
    });

    const generateResult = await generateResponse.json();
    
    if (!generateResult.success) {
      throw new Error(generateResult.error);
    }

    const orderId = generateResult.data.orderId;
    
    // 2. 如果有订单ID，进行轮询
    if (orderId) {
      console.log('开始轮询订单状态, orderId:', orderId);
      return await pollOrderStatus(orderId);
    } else {
      // 同步返回结果
      return generateResult.data.images;
    }
  } catch (error) {
    console.error('生成失败:', error.message);
    throw error;
  }
}

/**
 * 轮询订单状态
 */
async function pollOrderStatus(orderId, maxAttempts = 30) {
  const interval = 2000; // 2秒轮询一次
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`/api/ai/order-status?orderId=${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        const order = result.data;
        
        console.log(`轮询第${i + 1}次, 状态: ${order.status}`);
        
        if (order.status === 'success') {
          console.log('生成成功!');
          return order.result_urls || order.result_data;
        } else if (order.status === 'failed') {
          throw new Error(order.error_message || '生成失败');
        }
        // processing 状态继续轮询
      }
      
      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error('轮询出错:', error.message);
      throw error;
    }
  }
  
  throw new Error('轮询超时，请稍后查看生成历史');
}

// 使用示例
// generateImageWithPolling("一个未来科技感的城市夜景", "tuzi");

// ============================================================================
// 3. 获取生成历史示例
// ============================================================================

/**
 * 获取用户的图片生成历史
 */
async function getGenerationHistory(page = 1, limit = 20, type = 'image') {
  try {
    const response = await fetch(`/api/ai-generations?type=${type}&page=${page}&limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`获取到 ${result.data.length} 条记录`);
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('获取历史记录失败:', error.message);
    return [];
  }
}

/**
 * 获取所有生成历史（分页获取）
 */
async function getAllGenerationHistory(type = 'image') {
  const allRecords = [];
  let page = 1;
  const limit = 50;
  
  while (true) {
    const records = await getGenerationHistory(page, limit, type);
    
    if (records.length > 0) {
      allRecords.push(...records);
      page++;
      
      // 如果返回的记录少于limit，说明已经是最后一页
      if (records.length < limit) {
        break;
      }
    } else {
      break;
    }
  }
  
  console.log(`总共获取到 ${allRecords.length} 条历史记录`);
  return allRecords;
}

// 使用示例
// getGenerationHistory(1, 10, 'image');
// getAllGenerationHistory('image');

// ============================================================================
// 4. 错误处理和重试示例
// ============================================================================

/**
 * 带重试机制的图片生成
 */
async function generateImageWithRetry(prompt, provider = 'tuzi', maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`第 ${attempt} 次尝试生成图片...`);
      
      const result = await generateBasicImage(prompt, provider);
      console.log('生成成功!');
      return result;
      
    } catch (error) {
      console.log(`第 ${attempt} 次尝试失败:`, error.message);
      
      // 某些错误不需要重试
      if (error.message.includes('积分不足') || 
          error.message.includes('not authenticated') ||
          error.message.includes('access denied')) {
        throw error; // 直接抛出，不重试
      }
      
      // 最后一次尝试失败
      if (attempt === maxRetries) {
        throw new Error(`生成失败，已重试 ${maxRetries} 次: ${error.message}`);
      }
      
      // 等待后重试（递增等待时间）
      const waitTime = 1000 * attempt;
      console.log(`等待 ${waitTime}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// 使用示例
// generateImageWithRetry("一朵盛开的玫瑰花", "tuzi", 3);

// ============================================================================
// 5. React Hook 示例
// ============================================================================

/**
 * React Hook for AI Image Generation
 * 在 React 项目中使用
 */
function useAIImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // 生成图片
  const generateImage = useCallback(async (prompt, provider = 'tuzi') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateImageWithPolling(prompt, provider);
      setImages(result);
      
      // 刷新历史记录
      await refreshHistory();
      
      return { success: true, images: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // 刷新历史记录
  const refreshHistory = useCallback(async () => {
    try {
      const records = await getGenerationHistory(1, 20, 'image');
      setHistory(records);
    } catch (err) {
      console.error('刷新历史记录失败:', err.message);
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 初始化时加载历史记录
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    loading,
    images,
    error,
    history,
    generateImage,
    refreshHistory,
    clearError
  };
}

// ============================================================================
// 6. 完整的 React 组件示例
// ============================================================================

/**
 * 完整的图片生成组件
 */
function ImageGeneratorComponent() {
  const {
    loading,
    images,
    error,
    history,
    generateImage,
    clearError
  } = useAIImageGeneration();
  
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('tuzi');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入图片描述');
      return;
    }

    const result = await generateImage(prompt, provider);
    
    if (result.success) {
      console.log('生成成功:', result.images);
    } else {
      console.error('生成失败:', result.error);
    }
  };

  return (
    <div className="image-generator">
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          rows={3}
          className="prompt-input"
        />
        
        <div className="controls">
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
            className="provider-select"
          >
            <option value="tuzi">Tuzi (兔子API)</option>
            <option value="openai">OpenAI DALL-E</option>
            <option value="kling">Kling</option>
          </select>
          
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="generate-button"
          >
            {loading ? '生成中...' : '生成图片'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <div className="results-section">
        <h3>生成结果</h3>
        <div className="images-grid">
          {images.map((img, index) => (
            <img
              key={index}
              src={img.url || img}
              alt={`Generated ${index + 1}`}
              className="generated-image"
            />
          ))}
        </div>
      </div>

      <div className="history-section">
        <h3>生成历史</h3>
        <div className="history-list">
          {history.map((record) => (
            <div key={record.id} className="history-item">
              <div className="history-info">
                <span className="prompt">{record.prompt}</span>
                <span className="provider">{record.provider}</span>
                <span className="status">{record.status}</span>
              </div>
              {record.result_urls && (
                <div className="history-images">
                  {record.result_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="History"
                      className="history-image"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 导出所有函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateBasicImage,
    generateImageWithPolling,
    pollOrderStatus,
    getGenerationHistory,
    getAllGenerationHistory,
    generateImageWithRetry,
    useAIImageGeneration,
    ImageGeneratorComponent
  };
}
