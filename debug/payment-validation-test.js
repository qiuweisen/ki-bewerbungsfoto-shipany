/**
 * 支付校验逻辑测试
 * 用于验证修复后的支付金额校验是否正确工作
 */

// 模拟 pricing 配置数据
const mockPricingItems = [
  {
    product_id: "starter",
    interval: "one-time",
    amount: 9900,      // 美元金额（分）
    cn_amount: 69900,  // 人民币金额（分）
    currency: "USD"
  },
  {
    product_id: "standard", 
    interval: "one-time",
    amount: 19900,     // 美元金额（分）
    cn_amount: 139900, // 人民币金额（分）
    currency: "USD"
  }
];

// 修复后的校验逻辑
function validateCheckoutParams(product_id, amount, currency, interval, items) {
  const item = items.find(item => item.product_id === product_id);
  
  if (!item || !item.interval) {
    return { valid: false, error: "invalid checkout params" };
  }

  // 根据货币类型确定期望的金额和货币
  let expectedAmount = item.amount;
  let expectedCurrency = item.currency;

  // 如果是人民币支付，使用中国金额
  if (currency === "cny" || currency === "CNY") {
    expectedAmount = item.cn_amount || item.amount;
    expectedCurrency = "cny";
  }

  if (
    !expectedAmount ||
    expectedAmount !== amount ||
    item.interval !== interval ||
    expectedCurrency.toLowerCase() !== currency.toLowerCase()
  ) {
    return { valid: false, error: "invalid checkout params" };
  }

  return { valid: true };
}

// 测试用例
const testCases = [
  // 美元支付测试
  {
    name: "美元支付 - starter",
    params: { product_id: "starter", amount: 9900, currency: "USD", interval: "one-time" },
    expected: true
  },
  {
    name: "美元支付 - standard", 
    params: { product_id: "standard", amount: 19900, currency: "USD", interval: "one-time" },
    expected: true
  },
  
  // 人民币支付测试
  {
    name: "人民币支付 - starter",
    params: { product_id: "starter", amount: 69900, currency: "cny", interval: "one-time" },
    expected: true
  },
  {
    name: "人民币支付 - standard",
    params: { product_id: "standard", amount: 139900, currency: "CNY", interval: "one-time" },
    expected: true
  },
  
  // 错误金额测试
  {
    name: "错误金额 - 美元",
    params: { product_id: "starter", amount: 8900, currency: "USD", interval: "one-time" },
    expected: false
  },
  {
    name: "错误金额 - 人民币",
    params: { product_id: "starter", amount: 59900, currency: "cny", interval: "one-time" },
    expected: false
  },
  
  // 货币不匹配测试
  {
    name: "货币不匹配 - 用美元金额但指定人民币",
    params: { product_id: "starter", amount: 9900, currency: "cny", interval: "one-time" },
    expected: false
  },
  {
    name: "货币不匹配 - 用人民币金额但指定美元",
    params: { product_id: "starter", amount: 69900, currency: "USD", interval: "one-time" },
    expected: false
  }
];

// 运行测试
console.log("=== 支付校验逻辑测试 ===\n");

testCases.forEach((testCase, index) => {
  const result = validateCheckoutParams(
    testCase.params.product_id,
    testCase.params.amount,
    testCase.params.currency,
    testCase.params.interval,
    mockPricingItems
  );
  
  const passed = result.valid === testCase.expected;
  const status = passed ? "✅ PASS" : "❌ FAIL";
  
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   参数: ${JSON.stringify(testCase.params)}`);
  console.log(`   期望: ${testCase.expected ? "通过" : "失败"}`);
  console.log(`   实际: ${result.valid ? "通过" : "失败"} ${result.error ? `(${result.error})` : ""}`);
  console.log(`   结果: ${status}\n`);
});

console.log("测试完成！");
