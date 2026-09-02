// 자투리 시간 추천 알고리즘
//
// 할 일은 두 종류로 나뉜다.
//   - "끝까지 해야 하는" 할 일  -> 0/1 배낭 문제 (통째로 넣거나 아예 안 넣거나)
//   - "끊어도 되는" 할 일      -> 분수 배낭 문제 (남는 시간만큼만 부분적으로 넣기)
//
// 두 종류를 하나의 자투리 시간 안에서 같이 고려해야 하므로,
// "끝까지 해야 하는 할 일에 시간을 w분 쓰고, 나머지는 끊어도 되는 할 일로 채운다"
// 는 가정 아래 모든 w(0..capacity)에 대해 최댓값을 구하는 방식으로 결합한다.
//
// 이 파일은 UI와 완전히 분리된 순수 함수만 담는다 (부작용 없음, 테스트하기 쉬움).

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {number} duration   - 소요 시간(분), 1 이상의 정수
 * @property {number} value      - 중요도/가치, 클수록 우선
 * @property {boolean} splittable - true면 끊어도 되는 할 일, false면 끝까지 해야 하는 할 일
 */

/**
 * 0/1 배낭 DP 테이블을 만든다.
 * dp[i][w] = 앞의 i개 할 일만 고려했을 때, 용량 w 이하에서 얻을 수 있는 최대 가치
 *
 * dp[fixed.length]는 "용량 0..capacity 전체"에 대한 최적값을 한 번에 담고 있으므로,
 * 이후 분수 배낭 부분과 결합할 때 이 행 전체를 그대로 재사용할 수 있다.
 */
function buildZeroOneTable(fixedTasks, capacity) {
  const n = fixedTasks.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { duration, value } = fixedTasks[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (duration <= w) {
        const candidate = dp[i - 1][w - duration] + value;
        if (candidate > dp[i][w]) dp[i][w] = candidate;
      }
    }
  }
  return dp;
}

/** DP 테이블을 역추적해서 특정 용량 w에서 실제로 선택된 할 일 목록을 복원한다. */
function traceSelected(dp, fixedTasks, w) {
  const selected = [];
  let i = fixedTasks.length;
  let remaining = w;
  while (i > 0) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      const task = fixedTasks[i - 1];
      selected.push(task);
      remaining -= task.duration;
    }
    i--;
  }
  return selected.reverse();
}

/**
 * 끊어도 되는 할 일들을 "밀도(가치/시간)"가 높은 순으로 정렬한 뒤,
 * 누적 시간/가치 구간(breakpoint)을 만든다.
 * 분수 배낭 문제는 이 순서대로 그리디하게 채우는 것이 이미 최적해임이 증명되어 있다.
 */
function buildFractionalBreakpoints(flexibleTasks) {
  const sorted = [...flexibleTasks].sort(
    (a, b) => b.value / b.duration - a.value / a.duration
  );

  const breakpoints = [{ duration: 0, value: 0 }];
  for (const task of sorted) {
    const prev = breakpoints[breakpoints.length - 1];
    breakpoints.push({
      duration: prev.duration + task.duration,
      value: prev.value + task.value,
      task,
    });
  }
  return { sorted, breakpoints };
}

/** 남은 시간 r분을 끊어도 되는 할 일들로 채웠을 때 얻는 최대 가치를 구한다. */
function fractionalValueAt(breakpoints, r) {
  if (r <= 0) return 0;
  for (let k = 1; k < breakpoints.length; k++) {
    const prev = breakpoints[k - 1];
    const curr = breakpoints[k];
    if (r <= curr.duration) {
      const density = curr.task.value / curr.task.duration;
      return prev.value + density * (r - prev.duration);
    }
  }
  // 모든 끊어도 되는 할 일을 다 써도 시간이 남는 경우
  return breakpoints[breakpoints.length - 1].value;
}

/** 남은 시간 r분을 실제로 어떤 할 일에 몇 분씩 배정했는지 구한다 (결과 표시용). */
function allocateFractional(sorted, r) {
  const allocations = [];
  let remaining = r;
  for (const task of sorted) {
    if (remaining <= 0) break;
    const minutesUsed = Math.min(task.duration, remaining);
    if (minutesUsed <= 0) continue;
    const valueEarned = (task.value / task.duration) * minutesUsed;
    allocations.push({ task, minutesUsed, valueEarned, isPartial: minutesUsed < task.duration });
    remaining -= minutesUsed;
  }
  return allocations;
}

/**
 * 메인 함수: 할 일 목록과 자투리 시간(분)을 받아 최적 추천을 반환한다.
 *
 * @param {Task[]} tasks
 * @param {number} capacityMinutes
 */
export function recommend(tasks, capacityMinutes) {
  const capacity = Math.max(0, Math.floor(capacityMinutes || 0));
  const validTasks = tasks.filter((t) => t.duration > 0);

  const fixedTasks = validTasks.filter((t) => !t.splittable);
  const flexibleTasks = validTasks.filter((t) => t.splittable);

  if (capacity === 0 || validTasks.length === 0) {
    return { totalValue: 0, usedMinutes: 0, fixedSelected: [], flexibleAllocations: [] };
  }

  const dp = buildZeroOneTable(fixedTasks, capacity);
  const fixedValueAt = dp[fixedTasks.length]; // 길이 capacity+1 배열

  const { sorted, breakpoints } = buildFractionalBreakpoints(flexibleTasks);

  // "끝까지 해야 하는 할 일"에 w분을 쓰고 나머지를 "끊어도 되는 할 일"로 채울 때
  // 총 가치가 최대가 되는 w를 찾는다.
  let bestW = 0;
  let bestTotal = -1;
  for (let w = 0; w <= capacity; w++) {
    const total = fixedValueAt[w] + fractionalValueAt(breakpoints, capacity - w);
    if (total > bestTotal) {
      bestTotal = total;
      bestW = w;
    }
  }

  const fixedSelected = traceSelected(dp, fixedTasks, bestW);
  const flexibleAllocations = allocateFractional(sorted, capacity - bestW);

  const usedMinutes =
    bestW + flexibleAllocations.reduce((sum, a) => sum + a.minutesUsed, 0);

  return {
    totalValue: Math.round(bestTotal * 100) / 100,
    usedMinutes,
    fixedSelected,
    flexibleAllocations,
  };
}
