// ==========================================
// 短视频模仿策略导航仪 - 核心逻辑
// ==========================================

// 故事线节点切换 (全局控制)
function toggleStoryNode(element) {
    element.classList.toggle('collapsed');

    // 隐藏提示文字 (仅在第一次交互时触发)
    const hint = document.getElementById('story-interaction-hint');
    if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 500); // 彻底移除
    }

    // 检查 Page 2 是否 4 个节点都已全部展开，解锁“解析诊断模型本体”按钮
    const openedNodes = document.querySelectorAll('#page-2 .story-node:not(.collapsed)').length;
    const nextBtnContainer = document.querySelector('#page-2 .bottom-action');
    if (openedNodes >= 4) {
        nextBtnContainer.classList.add('show');
    }
}

// 初始化粒子背景与首屏背景图
document.addEventListener('DOMContentLoaded', function () {
    // 强制首屏背景逻辑
    const bgContainer = document.getElementById('particles-js');
    bgContainer.classList.add('bg-vibe-1');

    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": ["#ffffff", "#f72585", "#7209b7", "#4cc9f0"] },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
            "size": { "value": 4, "random": true, "anim": { "enable": false } },
            "line_linked": { "enable": true, "distance": 150, "color": "rgba(255,255,255,0.2)", "opacity": 0.4, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "bubble" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
            "modes": { "bubble": { "distance": 200, "size": 6, "duration": 2, "opacity": 0.8, "speed": 3 }, "push": { "particles_nb": 4 } }
        },
        "retina_detect": true
    });
});

// 全局变量存储数据
let userData = {
    xa: 0, xb: 0, m1: 0, m2: 0, m3: 0,
    y1: 0, y2: 0
};

// 模式控制
let isFastMode = false;
function setFastMode(val) {
    isFastMode = val;
    console.log("Mode Switch -> isFastMode:", isFastMode);

    // 全局切换模式类名
    const appBody = document.body;
    if (isFastMode) {
        appBody.classList.add('mode-intuitive');
        appBody.classList.remove('mode-principle');
    } else {
        appBody.classList.add('mode-principle');
        appBody.classList.remove('mode-intuitive');
    }
}

// 调试工具控制
window.toggleDebugMenu = function () {
    console.log("toggleDebugMenu called");
    const menu = document.getElementById('debug-menu');
    if (!menu) return;
    const isHidden = menu.style.display === 'none';
    menu.style.display = isHidden ? 'block' : 'none';
}

window.jumpToPage = function (index) {
    nextPage(index);
    window.toggleDebugMenu();

    // 如果是跳转到结果页，尝试渲染图表
    if (index == 11 || index == '11-intuitive') {
        setTimeout(showResults, 100);
    }
}

// 测评状态
let quizData = {
    xa: 0,
    xb: 0,
    currentStep: 1,
    totalSteps: 3
};

// 重新启动整个诊断系统，清空所有历史数据缓存
// 重新启动整个诊断系统，直接刷新页面
window.restartApp = function () {
    window.location.reload();
}

// 理论层级切换逻辑
function toggleTheory(element) {
    const isActive = element.classList.contains('active');

    // 关闭所有其他的
    document.querySelectorAll('.theory-card').forEach(card => {
        card.classList.remove('active');
    });

    // 如果之前不是激活状态，则切换当前的
    if (!isActive) {
        element.classList.add('active');
    }
}

// 显示特殊路径提示
function showPathTooltip(event) {
    event.stopPropagation();
    const tooltip = document.getElementById('path-tooltip');
    tooltip.classList.add('active');

    setTimeout(() => {
        tooltip.classList.remove('active');
    }, 2000);
}

// 切换 XA 路径显示
function toggleXAPaths() {
    const container = document.querySelector('.model-mediation-container');
    container.classList.toggle('show-xa');
    drawMediationPaths();
}

// 切换 XB 路径显示
function toggleXBPaths() {
    const container = document.querySelector('.model-mediation-container');
    container.classList.toggle('show-xb');
    drawMediationPaths(); // 点击时重绘确保位置准确
}

// 动态绘制中介模型路径
function drawMediationPaths() {
    const svg = document.getElementById('mediation-svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const paths = svg.querySelectorAll('path');

    paths.forEach(path => {
        const parts = path.id.split('-');
        if (parts.length < 5) return;

        const sourceId = parts[1] + '-' + parts[2];
        const targetId = parts[3] + '-' + parts[4];

        const startNode = document.getElementById(sourceId);
        const endNode = document.getElementById(targetId);

        if (startNode && endNode) {
            const startRect = startNode.getBoundingClientRect();
            const endRect = endNode.getBoundingClientRect();

            // 计算起始点：源节点右中
            const x1 = startRect.right - svgRect.left;
            const y1 = (startRect.top + startRect.height / 2) - svgRect.top;

            // 计算终点：目标节点左中
            const x2 = endRect.left - svgRect.left;
            const y2 = (endRect.top + endRect.height / 2) - svgRect.top;

            // 绘制贝塞尔曲线
            const cp1x = x1 + (x2 - x1) * 0.4;
            const cp2x = x1 + (x2 - x1) * 0.6;
            path.setAttribute('d', `M ${x1},${y1} C ${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`);
        }
    });
}

// 监听窗口大小变化
window.addEventListener('resize', drawMediationPaths);

// 页面导航逻辑
function nextPage(pageIndex) {
    const currentActive = document.querySelector('.page.active');
    const next = document.getElementById(`page-${pageIndex}`);

    if (!next) return;
    if (currentActive === next) {
        // 如果已在当前页，仅更新模式状态并直接返回，不触发转场动画
        if (!isFastMode) next.classList.add('theory-mode');
        else next.classList.remove('theory-mode');
        return;
    }

    if (currentActive) {
        currentActive.classList.remove('active', 'animate-up');
        currentActive.classList.add('slide-out');
    }

    next.classList.remove('slide-out');
    next.classList.add('active');

    // 应用理论模式状态 (仅针对 P3-P13)
    if (pageIndex >= 3) {
        if (!isFastMode) next.classList.add('theory-mode');
        else next.classList.remove('theory-mode');
    }

    // 针对特定页面的背景切换与平滑过渡逻辑
    const bgContainer = document.getElementById('particles-js');
    if (bgContainer) {
        if (pageIndex === 1 || pageIndex === 2) {
            bgContainer.classList.add('bg-vibe-1');
            bgContainer.classList.remove('bg-vibe-2', 'bg-vibe-diagnostic', 'bg-vibe-audit', 'bg-vibe-report');
        } else if (pageIndex === 3 || pageIndex === 4) {
            bgContainer.classList.add('bg-vibe-2');
            bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-diagnostic', 'bg-vibe-audit', 'bg-vibe-report');
        } else if (pageIndex === 5 || pageIndex === '5-result') {
            bgContainer.classList.add('bg-vibe-diagnostic');
            bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2', 'bg-vibe-audit', 'bg-vibe-report');
        } else if (pageIndex >= 6 && pageIndex <= 9) {
            bgContainer.classList.add('bg-vibe-audit');
            bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2', 'bg-vibe-diagnostic', 'bg-vibe-report');
        } else if (pageIndex >= 10) {
            bgContainer.classList.add('bg-vibe-report');
            bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2', 'bg-vibe-diagnostic', 'bg-vibe-audit');
        } else {
            bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2', 'bg-vibe-diagnostic', 'bg-vibe-audit', 'bg-vibe-report');
        }


    }


    // 针对特定页面的初始化逻辑
    if (pageIndex == 3) {
        const page3 = document.getElementById('page-3');
        page3.classList.add('is-intro');

        const revealP3 = () => {
            if (!page3.classList.contains('is-intro')) return;
            page3.classList.remove('is-intro');
            setTimeout(drawMediationPaths, 500);
            // 移除监听
            page3.removeEventListener('touchstart', revealP3);
            page3.removeEventListener('wheel', revealP3);
            page3.removeEventListener('mousedown', revealP3);
        };

        page3.addEventListener('touchstart', revealP3, { passive: true });
        page3.addEventListener('wheel', revealP3);
        page3.addEventListener('mousedown', revealP3);

        setTimeout(drawMediationPaths, 300);
    } else if (pageIndex == 4) {
        triggerP4Audit();
    } else if (pageIndex == 5) {
        // 关键修复：兼容旧版 WebView，不使用 NodeList.forEach
        const q1 = document.getElementById('q1');
        if (q1) {
            const steps = document.querySelectorAll('.quiz-step');
            for (let i = 0; i < steps.length; i++) {
                steps[i].classList.remove('active', 'exit-left', 'locked');
            }
            q1.classList.add('active');
        }
        // 重置进度条
        const units = document.querySelectorAll('.step-unit');
        for (let i = 0; i < units.length; i++) {
            units[i].classList.remove('active', 'completed');
        }
        const p5_s1 = document.getElementById('p5-step-1');
        if (p5_s1) p5_s1.classList.add('active');
    } else if (pageIndex == 6) {
        updateAuditUI('m1');
    } else if (pageIndex == 7) {
        updateAuditUI('m2');
    } else if (pageIndex == 8) {
        updateAuditUI('m3');
    } else if (pageIndex == 9) {
        setTimeout(drawSimPaths, 300); // 绘制三层模拟图路径
    } else if (pageIndex == 12) {
        populateFinalReport();
    }

    // 自动滚动到顶部 (移除 smooth 防抖)
    window.scrollTo(0, 0);
}

function prevPage(pageIndex) {
    const currentActive = document.querySelector('.page.active');
    const prev = document.getElementById(`page-${pageIndex}`);

    if (!prev) return;

    if (currentActive) {
        currentActive.classList.remove('active', 'animate-up', 'slide-out', 'theory-mode');
    }

    prev.classList.remove('slide-out');
    prev.classList.add('active');
    prev.classList.add('animate-up');

    // 应用理论模式状态
    if (pageIndex >= 3) {
        if (!isFastMode) prev.classList.add('theory-mode');
        else prev.classList.remove('theory-mode');
    }


    // 针对特定页面的背景切换逻辑
    const bgContainer = document.getElementById('particles-js');
    if (bgContainer) {
        // 使用 classList 而非 className 以免破坏其他类名
        bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2', 'bg-vibe-diagnostic', 'bg-vibe-audit', 'bg-vibe-report');
        if (pageIndex === 1 || pageIndex === 2) bgContainer.classList.add('bg-vibe-1');
        else if (pageIndex === 3 || pageIndex === 4) bgContainer.classList.add('bg-vibe-2');
        else if (pageIndex === 5 || pageIndex === '5-result') bgContainer.classList.add('bg-vibe-diagnostic');
        else if (pageIndex >= 6 && pageIndex <= 9) bgContainer.classList.add('bg-vibe-audit');
        else if (pageIndex >= 10) bgContainer.classList.add('bg-vibe-report');
    }

    // 自动滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageIndex == 3) {
        setTimeout(drawMediationPaths, 300);
    }
}

// 绘制 Page 9 的三层模拟路径
function drawSimPaths() {
    const svg = document.getElementById('sim-svg');
    const container = document.getElementById('sim-container');
    if (!svg || !container) return;

    svg.innerHTML = ''; // 清空旧路径
    const svgRect = svg.getBoundingClientRect();
    const isXA = userData.xa >= userData.xb;

    // 获取 0-100 的原始进度（由于模拟前已获取）
    const getPrefixScore = (prefix) => {
        const s1 = parseInt(document.getElementById(`${prefix}_1`).value);
        const s2 = parseInt(document.getElementById(`${prefix}_2`).value);
        const s3 = parseInt(document.getElementById(`${prefix}_3`).value);
        return (s1 + s2 + s3) / 3;
    };

    let rawM1 = getPrefixScore('m1');
    let rawM2 = getPrefixScore('m2');
    let rawM3 = getPrefixScore('m3');

    // M1 与 M2 强制归一化 (总和100%)
    const totalM1M2 = rawM1 + rawM2;
    let normM1 = 50;
    let normM2 = 50;
    if (totalM1M2 > 0) {
        normM1 = (rawM1 / totalM1M2) * 100;
        normM2 = (rawM2 / totalM1M2) * 100;
    }

    // 更新主路径状态文字
    const pathTag = document.getElementById('main-path-tag');
    pathTag.textContent = isXA ? "XA 心理驱动主链路" : "XB 平台驱动主链路";
    pathTag.className = isXA ? "value text-blue" : "value text-purple";

    // 准确映射用户的真实输入作为 X->M 阶段的系数标签
    const weightM1 = (normM1 / 100).toFixed(2);
    const weightM2 = (normM2 / 100).toFixed(2);
    const weightM3 = (rawM3 / 100).toFixed(2);

    // 严谨判断：依据归一化后的占比
    const activeM1 = normM1 > 50;
    const activeM2 = normM2 > 50;
    const activeM3 = rawM3 > 50;

    let links = [];

    if (isXA) {
        // XA 模式：用户的真实行为权重
        links.push({ s: 'node-sim-xa', t: 'node-sim-m1', label: weightM1, p: activeM1 });
        links.push({ s: 'node-sim-xa', t: 'node-sim-m2', label: weightM2, p: activeM2 });
        links.push({ s: 'node-sim-xa', t: 'node-sim-m3', label: weightM3, p: activeM3 });

        // XA 模式：真实的论文回归系数 (M -> Y)
        links.push({ s: 'node-sim-m1', t: 'node-sim-y2', label: '0.39', p: activeM1 }); // M1 仅极强影响内核
        links.push({ s: 'node-sim-m2', t: 'node-sim-y1', label: '0.33', p: activeM2 }); // M2 极强影响躯壳
        links.push({ s: 'node-sim-m3', t: 'node-sim-y1', label: '0.20', p: activeM3 });
        links.push({ s: 'node-sim-m3', t: 'node-sim-y2', label: '0.26', p: activeM3 });
    } else {
        // XB 模式：用户的真实行为权重
        links.push({ s: 'node-sim-xb', t: 'node-sim-m1', label: weightM1, p: activeM1 });
        links.push({ s: 'node-sim-xb', t: 'node-sim-m2', label: weightM2, p: activeM2 });
        links.push({ s: 'node-sim-xb', t: 'node-sim-m3', label: weightM3, p: activeM3 });

        // XB 模式：真实的论文回归系数 (M -> Y) 全链路代偿
        links.push({ s: 'node-sim-m1', t: 'node-sim-y1', label: '0.26', p: activeM1 });
        links.push({ s: 'node-sim-m1', t: 'node-sim-y2', label: '0.49', p: activeM1 });
        links.push({ s: 'node-sim-m2', t: 'node-sim-y1', label: '0.48', p: activeM2 });
        links.push({ s: 'node-sim-m2', t: 'node-sim-y2', label: '0.16', p: activeM2 });
        links.push({ s: 'node-sim-m3', t: 'node-sim-y1', label: '0.16', p: activeM3 });
        links.push({ s: 'node-sim-m3', t: 'node-sim-y2', label: '0.16', p: activeM3 });
    }

    links.forEach(link => {
        const startNode = document.getElementById(link.s);
        const endNode = document.getElementById(link.t);

        if (startNode && endNode) {
            const startRect = startNode.getBoundingClientRect();
            const endRect = endNode.getBoundingClientRect();

            const x1 = startRect.right - svgRect.left;
            const y1 = (startRect.top + startRect.height / 2) - svgRect.top;
            const x2 = endRect.left - svgRect.left;
            const y2 = (endRect.top + endRect.height / 2) - svgRect.top;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const cp1x = x1 + (x2 - x1) * 0.4;
            const cp2x = x1 + (x2 - x1) * 0.6;

            path.setAttribute('d', `M ${x1},${y1} C ${cp1x},${y1} ${cp2x},${y2} ${x2},${y2}`);
            path.setAttribute('class', `sim-path ${link.p ? 'active' : ''}`);
            svg.appendChild(path);

            // 添加系数标签 (SVG Text)
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'sim-path-label');
            text.textContent = link.label;
            svg.appendChild(text);
        }
    });

    // 不需要用户点击，模拟 2.5 秒后自动进入计算流程
    setTimeout(() => {
        if (document.getElementById('page-9').classList.contains('active')) {
            startAnalysis();
        }
    }, 2500);
}

// 实时更新评议页面的 UI 反馈
function updateAuditUI(prefix) {
    const s1 = parseInt(document.getElementById(`${prefix}_1`).value);
    const s2 = parseInt(document.getElementById(`${prefix}_2`).value);
    const s3 = parseInt(document.getElementById(`${prefix}_3`).value);
    const total = s1 + s2 + s3;

    // 1. 更新各分项数值标签
    const val1 = document.getElementById(`val-${prefix}-1`);
    const val2 = document.getElementById(`val-${prefix}-2`);
    const val3 = document.getElementById(`val-${prefix}-3`);
    if (val1) val1.textContent = s1 + '%';
    if (val2) val2.textContent = s2 + '%';
    if (val3) val3.textContent = s3 + '%';

    // 2. 核心可视化：更新独立页面的仪表盘/进度条
    const avgScore = Math.round(total / 3);
    const totalDisplay = document.getElementById(`val-${prefix}-total`);
    const fillIndicator = document.getElementById(`fill-${prefix}-total`);

    if (totalDisplay) totalDisplay.textContent = avgScore + '%';
    if (fillIndicator) {
        if (prefix === 'm1') {
            // 圆形 SVG 进度逻辑 (周长约 283)
            const offset = 283 - (283 * avgScore / 100);
            fillIndicator.style.strokeDashoffset = offset;
        } else {
            // 线性或 Gauge 进度
            fillIndicator.style.width = avgScore + '%';
        }
    }

    // 3. 实时学术建议反馈 (原本的文案)
    const feedback = document.getElementById(`${prefix}-feedback`);
    const isXA = userData.xa >= userData.xb;

    let message = "";
    let statusClass = "";

    if (prefix === 'm1') {
        if (isXA) {
            if (total > 150) {
                message = "✨ 极佳！作为心理驱动型用户，您的高复刻度正有效维系模因内核，利于深层共鸣。";
                statusClass = "good";
            } else {
                message = "⚠️ 警示：复刻度偏低。心理驱动型若失去基因型还原，将导致受众身份认同感流失。";
                statusClass = "warning";
            }
        } else {
            message = "💡 提示：对于流量驱动型，M1 并非核心目标，但适当的还原能确保基本的模因识别。";
            statusClass = "info";
        }
    } else if (prefix === 'm2') {
        if (!isXA) {
            if (total > 150) {
                message = "🔥 完美！高变异度正助您绕过算法查重，极大地提升了表现型躯壳的破圈力。";
                statusClass = "good";
            } else {
                message = "⚠️ 警示：内容同质化。平台驱动型若缺乏变异，极易被算法判定为低质量重复。";
                statusClass = "warning";
            }
        } else {
            message = "💡 提示：过度变异可能会稀释您的情感内核，请在表达自我时注意平衡。";
            statusClass = "info";
        }
    } else if (prefix === 'm3') {
        if (total > 200) {
            message = "🔥 懂流量！你的内容完美切合了平台的流行节奏。这种高度的默契能让视频更快速被系统推给对的人，大爆几率翻倍！";
            statusClass = "good";
        } else if (total > 100) {
            message = "✅ 稳住了：目前的打法策略很稳健，符合大部分用户的刷视频习惯。保持这种状态，流量基本盘会很稳。";
            statusClass = "info";
        } else {
            message = "🔴 需改进：内容似乎还没跟上平台的流行步调。如果不优化标签或增加互动话题，视频很容易淹没在茫茫大海中。";
            statusClass = "warning";
        }
    }

    if (feedback) {
        feedback.innerHTML = `<div class="feedback-box ${statusClass}">${message}</div>`;
    }

    // --- 新增：触觉反馈 (极端值震动) ---
    const currentValues = [s1, s2, s3];
    if (currentValues.some(v => v > 95 || v < 5)) {
        if (window.navigator && window.navigator.vibrate) {
            // 短暂脉冲震动
            window.navigator.vibrate(10);
        }
    }
}



// 修正：更精确的分值映射逻辑
function getSliderSum(prefix) {
    const sliders = [`${prefix}_1`, `${prefix}_2`, `${prefix}_3`].map(id => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value) : 50;
    });

    const avgScore = sliders.reduce((a, b) => a + b, 0) / 3;
    // 将 0-100 映射到 1-15 原始逻辑
    return Math.max(1, Math.round((avgScore / 100) * 15 * 3) / 3);
}

// 驱动力测评题目选择逻辑 (最强反馈版)
function selectChoice(type, step, event) {
    // 强制断焦：消除跳动的绿色光标/焦点框
    if (document.activeElement) document.activeElement.blur();

    const p5 = document.getElementById('page-5');
    if (p5) {
        p5.classList.remove('quiz-step-1', 'quiz-step-2', 'quiz-step-3');
        p5.classList.add(`quiz-step-${step + 1}`);
    }

    const currentQ = document.getElementById(`q${step}`);
    if (currentQ.classList.contains('locked')) return;
    currentQ.classList.add('locked');

    // 视觉确认
    const clickedBtn = event.currentTarget;
    clickedBtn.classList.add('selected');

    if (type === 'xa') userData.xa += 3.5;
    else userData.xb += 3.5;

    const currentStepUnit = document.getElementById(`p5-step-${step}`);
    if (currentStepUnit) {
        currentStepUnit.classList.remove('active');
        currentStepUnit.classList.add('completed');
    }

    // 同步切换：移除延迟，防止容器高度坍塌导致的“跳动”
    if (step < 3) {
        const nextStepUnit = document.getElementById(`p5-step-${step + 1}`);
        if (nextStepUnit) nextStepUnit.classList.add('active');

        setTimeout(() => {
            currentQ.classList.remove('active', 'locked');
            const nextQ = document.getElementById(`q${step + 1}`);
            if (nextQ) nextQ.classList.add('active');
        }, 300); // 缩短等待感
    } else {
        setTimeout(finalizeQuiz, 400);
    }
}

// 基于论文的学术路径系数常量 (PROCESS Model 4)
const PATH_COEFFICIENTS = {
    xa_m1_y2: { total: 0.39, sig: "***", desc: "心理驱动通过基因型复刻影响内核稳定性" },
    xb_m2_y1: { total: 0.48, sig: "***", desc: "平台驱动通过表现型变异影响躯壳满意度" },
    m3_y1: { total: 0.16, sig: "**", desc: "算法选择对流量获取的正向调节作用" }
};

function showScoreDetail(type) {
    const modal = document.getElementById('score-modal');
    const title = document.getElementById('modal-title-text');
    const formula = document.getElementById('modal-formula-text');
    const desc = document.getElementById('modal-desc-text');
    const iconBox = document.getElementById('modal-icon-box');

    if (!modal) return;

    let content = { title: "", formula: "", desc: "", icon: "" };

    switch (type) {
        case 'm1':
            content = {
                title: "基因型复刻度 (M1)",
                formula: "M1 = ∑ (Auditory + Visual + Action) / 3",
                desc: "衡量模仿者对模因“灵魂基因”的还原程度。在论文第四章中，M1 正向显著影响内核稳定性(Y2)。",
                icon: '<i class="fa-solid fa-dna"></i>'
            };
            break;
        case 'm2':
            content = {
                title: "表现型变异度 (M2)",
                formula: "M2 = ∑ (Identity + Scene + Inversion) / 3",
                desc: "衡量“同构异义”的创新程度。有效的 M2 变异能帮助内容绕过算法查重，提升躯壳满意度(Y1)。",
                icon: '<i class="fa-solid fa-shuffle"></i>'
            };
            break;
        case 'y1':
            content = {
                title: "需求满足预测 (Y1)",
                formula: "Y1 = c₁'·XB + a₂b₂·M2 + a₃b₃·M3",
                desc: "躯壳层面的分发效率预测。反映了内容在平台算法环境下的生存与破圈能力。",
                icon: '<i class="fa-solid fa-chart-line"></i>'
            };
            break;
        case 'y2':
            content = {
                title: "内核稳定预测 (Y2)",
                formula: "Y2 = c₂'·XA + a₁b₁·M1 + a₃b₄·M3",
                desc: "心理层面的共鸣深度预测。反映了内容对模因原始意义的守护及受众的深层认同感。",
                icon: '<i class="fa-solid fa-shield-heart"></i>'
            };
            break;
    }

    title.textContent = content.title;
    formula.textContent = content.formula;
    desc.textContent = content.desc;
    iconBox.innerHTML = content.icon;

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function finalizeQuiz() {
    // 1. 判定诊断结果 (基于学术权重)
    const isXA = userData.xa >= userData.xb;
    const badge = document.getElementById('driver-type-badge');
    const title = document.getElementById('driver-type-title');
    const desc = document.getElementById('driver-type-desc');
    const iconBox = document.getElementById('driver-icon');

    if (isXA) {
        if (badge) {
            badge.textContent = "心理驱动 (XA)";
            badge.className = "badge-type bg-blue";
        }
        if (iconBox) {
            iconBox.className = "result-main-icon pulse-blue mb-10";
            iconBox.innerHTML = '<i class="fa-solid fa-heart-pulse"></i>';
        }
        if (title) title.textContent = "源头：情感同频型创作者";
        if (desc) desc.textContent = "您更擅长捕捉内容的“情绪内核”。通过「基因型模仿」（复刻爆款背后的底层逻辑与情感共鸣点），您能更自然地引起受众共鸣，这种深层链接是您内容爆火的关键驱动力。";
    } else {
        if (badge) {
            badge.textContent = "平台驱动 (XB)";
            badge.className = "badge-type bg-purple";
        }
        if (iconBox) {
            iconBox.className = "result-main-icon pulse-purple mb-10";
            iconBox.innerHTML = '<i class="fa-solid fa-bolt-lightning"></i>';
        }
        if (title) title.textContent = "源头：算法敏锐型创作者";
        if (desc) desc.textContent = "您对流量趋势感知极其敏锐。通过「表现型模仿」（复刻爆款的视听符号与外壳形式），您能高效利用平台的“流量套利”机制，更容易触发算法推荐实现快速爆火。";
    }

    // 2. 核心切换：进入独立的诊断结果揭晓页
    if (isFastMode) {
        nextPage('6-intuitive'); // 直观模式跳转到简约评议页
    } else {
        nextPage('5-result'); // 原理模式跳转到结果揭晓
    }

    // 3. 将测评结果映射到实际评议值 (赋值备份)
    userData.xa_result = userData.xa;
    userData.xb_result = userData.xb;
}


// 结束评议，决定是否跳转 P9 或直接分析
function finishAudit() {
    if (isFastMode) {
        // 直观模式在 P6-Intuitive 直接调用 startAnalysis
        startAnalysis();
    } else {
        nextPage(9);
    }
}

// 直观模式专项选择逻辑 (深度交互版)
window.selectIntuitive = function (type, val, step, el) {
    // 1. 数据静默采集
    const mapping = {
        'm1': ['m1_1', 'm1_2', 'm1_3'],
        'm2': ['m2_1', 'm2_2', 'm2_3'],
        'm3': ['m3_1', 'm3_2', 'm3_3']
    };
    if (mapping[type]) {
        mapping[type].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = val;
        });
    }

    // 2. 交互反馈：添加点击态
    if (el) {
        const parent = el.parentElement;
        parent.querySelectorAll('.i-option-card').forEach(c => c.classList.remove('clicked'));
        el.classList.add('clicked');

        // 触觉反馈 (如果支持)
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
    }

    // 3. 延迟转场，确保反馈被感知
    setTimeout(() => {
        const currentStep = document.getElementById(`i-step-${step}`);

        if (step < 3) {
            const nextStep = document.getElementById(`i-step-${step + 1}`);
            const nextNode = document.getElementById(`i-node-${step + 1}`);
            const progressFill = document.getElementById('i-progress-fill');

            // 执行飞出动画
            if (currentStep) {
                currentStep.classList.add('exit-left');
                setTimeout(() => {
                    currentStep.classList.remove('active', 'exit-left');
                    if (nextStep) {
                        nextStep.classList.add('active', 'enter-right');
                        // 强制重绘以触发动画
                        nextStep.offsetHeight;
                        nextStep.classList.remove('enter-right');
                    }
                    if (nextNode) nextNode.classList.add('active');
                    if (progressFill) progressFill.style.width = `${((step + 1) / 3) * 100}%`;
                }, 400);
            }
        } else {
            // 最后一题 -> 开启深度诊断模拟
            const hint = document.getElementById('i-analysis-hint');
            if (hint) {
                hint.style.display = 'flex';
                hint.classList.add('animate-fade-in');
            }
            setTimeout(() => {
                startAnalysis();
            }, 2200);
        }
    }, 450);
}

// 移除过时的直观模式辅助函数
// setIntuitiveValue, setPickLevel, syncFactorUI, updateIChoiceUI 均已由 selectIntuitive 接管逻辑


// 启动分析与加载动画
function startAnalysis() {
    nextPage(10); // 切换至流程中的第 10 页：过度动画页
    // 模拟算法计算过程...

    // 收集原始拖拽得分 (平均 0-100)
    const getRawAvg = (prefix) => {
        const s1 = parseInt(document.getElementById(`${prefix}_1`).value);
        const s2 = parseInt(document.getElementById(`${prefix}_2`).value);
        const s3 = parseInt(document.getElementById(`${prefix}_3`).value);
        return (s1 + s2 + s3) / 3;
    };

    let rawM1 = getRawAvg('m1');
    let rawM2 = getRawAvg('m2');
    let rawM3 = getRawAvg('m3');

    // 纠正逻辑：移除强制归一化，允许双低分存在
    userData.m1 = rawM1;
    userData.m2 = rawM2;
    userData.m3 = rawM3;

    // 直接同步 XA/XB 初始驱动值 (换算为 0-100)
    userData.xa = (userData.xa / 15) * 100;
    userData.xb = (userData.xb / 15) * 100;

    // ==============================================
    // 基于论文最新路径系数计算结果 (2026版逻辑修正)
    // ==============================================
    let m1 = userData.m1;
    let m2 = userData.m2;
    let m3 = userData.m3;
    let y1, y2;

    if (userData.xa >= userData.xb) {
        // 心理驱动(XA)
        y1 = 15 + (m2 * 0.6) + (m3 * 0.25);
        y2 = 15 + (m1 * 0.6) + (m3 * 0.25);
    } else {
        // 平台驱动(XB)
        y1 = 15 + (m1 * 0.2) + (m2 * 0.65) + (m3 * 0.2);
        y2 = 15 + (m1 * 0.65) + (m2 * 0.2) + (m3 * 0.15);
    }

    userData.y1 = Math.min(y1, 99.99);
    userData.y2 = Math.min(y2, 99.99);

    // 运行打字机效果模拟控制台
    simulateProcessing();
}

function simulateProcessing() {
    const logs = [
        "正在初始化「短视频模仿策略导航仪」诊断引擎 v3.0...",
        "正在检索历史模因库特征向量 (Vector Search)...",
        "正在计算内容同质化冲突率 (Collision Detection)...",
        "PROCESS Model 4 中介效应链路深度拟合...",
        "正在模拟 500 次初始分发流量池反馈数据...",
        "正在封装深度评议建议与 Y1/Y2 预测模型...",
        "诊断完成，正在生成评议报告文档..."
    ];

    const logContainer = document.getElementById('processing-logs');
    const progressBar = document.getElementById('calc-progress');
    let idx = 0;

    logContainer.innerHTML = '';

    let interval = setInterval(() => {
        if (idx < logs.length) {
            const p = document.createElement('p');
            p.className = 'log-item';
            p.style.opacity = '1';
            p.textContent = `[System] ${logs[idx]}`;
            logContainer.appendChild(p);
            logContainer.scrollTop = logContainer.scrollHeight;
            progressBar.style.width = `${(idx + 1) * 15}%`;
            idx++;
        } else {
            clearInterval(interval);
            setTimeout(showResults, 800);
        }
    }, 450);
}

function showResults() {
    if (isFastMode) {
        nextPage('11-intuitive');
        renderIntuitiveResults();
    } else {
        nextPage(11);
        renderFullResults();
    }
}

function renderFullResults() {
    const y1El = document.getElementById('y1-score');
    const y2El = document.getElementById('y2-score');
    const barEl = document.getElementById('y-ratio-bar');
    const pathTypeEl = document.getElementById('res-path-type');

    if (y1El) y1El.textContent = userData.y1.toFixed(1);
    if (y2El) y2El.textContent = userData.y2.toFixed(1);

    const yTotal = userData.y1 + userData.y2;
    if (barEl && yTotal > 0) {
        const yRatio = (userData.y2 / yTotal) * 100; // 展示 Y2 在条形图中的占比 (右侧权重)
        barEl.style.width = yRatio + '%';
    }

    const isXA = userData.xa >= userData.xb;
    if (pathTypeEl) {
        pathTypeEl.textContent = isXA ? "XA-M1-Y2 (心理驱动中介路径)" : "XB-M2-Y1 (平台驱动中介路径)";
    }

    try {
        renderRadarChart();
        generateAdvice();
    } catch (e) {
        console.error("Visual components Error:", e);
    }
}

function renderIntuitiveResults() {
    const scoreVal = (userData.y1 + userData.y2) / 2;
    const isXA = userData.xa >= userData.xb;

    // --- [核心定义] 初始化结局变量 ---
    let endingId = 0;
    let rankLabel = "";
    let persona = "";
    let ringColor = "var(--primary-color)";

    if (isXA) {
        // XA 路径严格执行 3 结局制 (1, 2, 3)
        if (userData.m1 < 70) {
            endingId = 2; rankLabel = "⚠️ 致命失误"; persona = "迷失的倒戈者"; ringColor = "#ff4d4d";
        } else if (userData.m3 >= 70) {
            // M1 达标 + M3 达标
            endingId = 3; rankLabel = "SSR 全能"; persona = "外挂社交达人"; ringColor = "#7209b7";
        } else {
            // M1 达标 + M3 一般
            endingId = 1; rankLabel = "S 级认同"; persona = "原教旨主义者"; ringColor = "#00f2ea";
        }
    } else {
        // XB 路径执行其余结局制 (4, 5, 6)
        if (userData.m2 >= 70 && userData.m3 >= 70) {
            endingId = 4; rankLabel = "S 级爆款"; persona = "流量收割机"; ringColor = "#7209b7";
        } else if (userData.m1 >= 70) {
            endingId = 5; rankLabel = "⚠️ 绝路"; persona = "拙劣模仿者"; ringColor = "#ff4d4d";
        } else {
            endingId = 6; rankLabel = "中庸局"; persona = "随大流者"; ringColor = "#888";
        }
    }

    // [关键修复] 将局部计算的结局 ID 同步到全局数据
    userData.ending = {
        id: endingId,
        name: rankLabel,
        color: ringColor
    };

    // 注入官方评价 (P11 重构版)
    const scoreNum = document.getElementById('i-total-score');
    const personaEl = document.getElementById('i-persona-label');
    const identityGlow = document.getElementById('i-identity-glow');

    if (scoreNum) scoreNum.textContent = rankLabel;
    if (personaEl) personaEl.textContent = `匹配生态位：${persona}`;

    // 动态调整极光颜色
    if (identityGlow) {
        identityGlow.style.background = `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`;
    }

    // --- [修复] 路径逻辑还原与染色 ---
    const visual = document.getElementById('i-path-visual');
    const nl1 = document.getElementById('nl-1');
    const nl2 = document.getElementById('nl-2');
    const nl3 = document.getElementById('nl-3');
    const pathDesc = document.getElementById('i-path-desc');

    if (visual) {
        if (isXA) {
            visual.classList.add('path-xa');
            visual.classList.remove('path-xb');
            if (nl1) nl1.textContent = "心理共鸣";
            if (nl2) nl2.textContent = "基因复刻度";
            if (nl3) nl3.textContent = "圈层认同";
            if (pathDesc) pathDesc.textContent = "系统分析显示：您的成功源于对模因深度情感内核的精准捕捉。";
        } else {
            visual.classList.add('path-xb');
            visual.classList.remove('path-xa');
            if (nl1) nl1.textContent = "平台驱动";
            if (nl2) nl2.textContent = "视觉变异度";
            if (nl3) nl3.textContent = "算法破圈";
            if (pathDesc) pathDesc.textContent = "系统分析显示：您的成功源于对视觉符号的大胆变异与流量博弈。";
        }
    }

    // 更新匹配标签
    const matchTag = document.getElementById('i-match-ending-tag');
    if (matchTag) {
        matchTag.innerHTML = `<i class="fa-solid fa-link mr-5"></i>已锁定生态位：结局 ${endingId}`;
    }

    // --- AI 诊断建议矩阵 (结局对齐版) ---
    const ADVICE_LIB = {
        1: "评价：您是完美的高还原达人。圈子里的人非常认可您的这种“原汁原味”，老粉丝很买账。建议：继续深挖这种垂直的还原感。",
        2: "警告：您这次改得有些“串味”了。虽然看着新鲜，但把原本最动人的内核弄丢了，老粉丝可能要取关。建议：找回原梗的灵魂。",
        3: "祝贺：您简直是天才！既完整保留了原梗的神韵，又让算法非常喜欢。建议：就按这个节奏拍，这就是您的财富密码。",
        4: "厉害：您是天生的流量玩家。您这种大胆的反差设计完全抓住了算法的胃口，很容易出爆款。建议：把这种大胆变样发扬光大。",
        5: "警告：您在盲目搬运。这种没有任何亮点的模仿在流量池里活不过第一轮。建议：赶紧加点您自己的创新，别再死板复刻了。",
        6: "评价：您的内容太寻常了。哪方面都一般，没有让人眼前一亮的燃点。建议：别再追求均衡，选一个极端点使劲发力。"
    };

    const mainAdvice = ADVICE_LIB[endingId];

    // --- 填充建议 ---
    const adviceEl = document.getElementById('i-advice-text');
    if (adviceEl) {
        adviceEl.innerHTML = `<span class="badge ${isXA ? 'bg-blue' : 'bg-purple'} mb-10">AI 原理诊断</span><br>${mainAdvice}`;
    }

    // --- 4. 生成动态小贴士 (Tips) ---
    const tipsList = document.getElementById('i-tips-list');
    if (tipsList) tipsList.innerHTML = ''; // 清空旧数据

    const addTip = (title, content, icon, delay) => {
        const item = document.createElement('div');
        item.className = 'tip-item';
        item.style.animationDelay = `${delay}s`;
        item.innerHTML = `
            <div class="tip-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="tip-content">
                <h4>${title}</h4>
                <p>${content}</p>
            </div>
        `;
        tipsList.appendChild(item);
    };

    // 根据因子数值给出具体建议
    let delay = 0.5;
    if (isXA && userData.m1 < 60) {
        addTip("警惕内核流失", "既然想引发情感共鸣，建议不要改动太多。保留核心的专属BGM和标志性场景动作，避免作品变味。", "fa-magnifying-glass-chart", delay);
        delay += 0.2;
    }
    if (!isXA && userData.m2 < 60) {
        addTip("打破视觉平庸", "您的内容现在就是一张“大众脸”，算法看都不看一眼。建议下次改得更“夸张”一点，搞个身份大反转或者换个怪场景，让大家一眼就记住您。", "fa-volcano", delay);
        delay += 0.2;
    }
    if (userData.m3 < 50) {
        addTip("算法辅助不可少", "哪怕内容再好，平台规则的利用还有待加强。适时埋设吐槽点，能显著提升分发量。", "fa-hashtag", delay);
        delay += 0.2;
    }

    // [关键同步] 传递官方评价标签至后续模块
    renderScriptAssist(isXA, endingId);
    syncShareCard(rankLabel);
    syncEcologicalEnding(rankLabel, isXA);
}

function syncEcologicalEnding(rank, isXA) {
    // 1. 清除旧的高亮
    document.querySelectorAll('.ending-card').forEach(c => c.classList.remove('active-ending'));

    // 2. 获取 M 数据进行细分判定 (基于 renderIntuitiveResults 逻辑)
    const m1 = userData.m1;
    const m2 = userData.m2;
    const m3 = userData.m3;
    let endingId = 0;

    if (isXA) {
        if (m1 < 70) endingId = 2;
        else if (m3 >= 70) endingId = 3;
        else endingId = 1;
    } else {
        if (m2 >= 70 && m3 >= 70) endingId = 4;
        else if (m1 >= 70) endingId = 5;
        else endingId = 6;
    }

    // 3. 动态更新 UI (修复空格问题)
    const targetCard = document.getElementById(`ending-card-${endingId}`);
    const targetBadge = document.getElementById(`ending-badge-${endingId}`);

    if (targetCard && targetBadge) {
        targetCard.classList.add('active-ending');
        targetBadge.textContent = `${rank}：匹配成功`;
        targetBadge.style.background = 'var(--primary-color)';
    }

    // 在 P11 报告页同步简易入口 (修复空格)
    const matchTag = document.getElementById('i-match-ending-tag');
    if (matchTag) {
        const names = ["", "原教旨主义者", "迷失的倒戈者", "外挂社交达人", "顶级流量收割机", "边缘模仿者", "随大流者"];
        matchTag.textContent = `判定结局：${names[endingId]} (${rank})`;
    }
}

// 创作脚本辅助逻辑 (结局强对齐版)
function renderScriptAssist(isXA, endingId) {
    const scriptBox = document.getElementById('i-script-area');
    if (!scriptBox) return;

    // 6 大结局专属策略库 (完全贴合原理模式)
    const STRATEGY_MAP = {
        1: "策略方案：既然您擅长还原，就继续走精品路线。下次拍的时候，把原梗的节奏和表情抓得更死一点，稳住您的核心粉丝圈。",
        2: "策划预警：您这次改得完全“跑偏”了。下次动身拍摄前，先琢磨下原梗为啥火，先把那个“味儿”找回来，再谈创新。",
        3: "核心执行：您已经摸透了走红的规律。现在不需要大改，只需要保持当前的创作频率。这种稳如泰山的平衡感就是您最大的护城河。",
        4: "行动建议：您这种大胆魔改就是您的招牌。下次试着找点更夸张、更有视觉反差的身份或场景，把新鲜感拉到最满。",
        5: "止损建议：赶紧停止纯模仿！这种“影子生活”没前途。下次试着放飞自我，加一个反转或者新元素，让算法注意到您的存在。",
        6: "破局建议：现在的内容不温不火，大家看一眼就滑走了。下次要么做得特别真、特别还原，要么改得特别猛，必须占一个“最”字才能出圈。"
    };

    const strategy = STRATEGY_MAP[endingId] || "建议结合模型系数进一步优化内容策略。";

    let html = `
        <div class="script-card" style="border:none; background: rgba(255,255,255,0.03); padding: 18px; border-radius: 16px;">
            <h5 class="text-xs font-bold mb-10" style="color: var(--primary-color);">
                <i class="fa-solid fa-wand-magic-sparkles mr-5"></i> 核心执行策略 (模因演化建议)
            </h5>
            <p style="font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); margin:0;">
                ${strategy}
            </p>
        </div>
        <!-- 删除了原有的学术图谱和实证案例库按钮 -->
    `;

    scriptBox.innerHTML = html;
}

function syncShareCard(rank) {
    const isXA = userData.xa >= userData.xb;

    // 1. 填充等级与基本信息
    const rankEl = document.getElementById('s-ending-rank');
    if (rankEl) rankEl.textContent = rank;

    const nameEl = document.getElementById('s-ending-name');
    if (nameEl) nameEl.textContent = userData.ending.name;

    const serialEl = document.getElementById('s-serial-no');
    if (serialEl) serialEl.textContent = userData.randomId || `MG-2026-X${Math.floor(Math.random() * 9 + 1)}`;

    // 2. 映射生态人格 (严格对齐原理模式/论文定义)
    const personaMap = {
        1: "完美的原教旨主义者",
        2: "迷失的倒戈者",
        3: "SSR 全能模因王",
        4: "极端的流量博弈者",
        5: "被淹没的影子模仿者",
        6: "平庸的中庸局内人"
    };
    const personaEl = document.getElementById('s-ending-persona');
    if (personaEl) personaEl.textContent = `生态人格：${personaMap[userData.ending.id] || "模因观察者"}`;

    // 3. 驱动三维能量条
    const setBar = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${val}%`;
    };
    setBar('s-bar-m1', userData.m1);
    setBar('s-bar-m2', userData.m2);
    setBar('s-bar-m3', userData.m3);

    // 4. 同步白话语录
    const quoteEl = document.getElementById('s-intuitive-quote');
    const sourceAdvice = document.getElementById('i-advice-text');
    if (quoteEl && sourceAdvice) {
        // 去掉 HTML 标签，仅保留纯文本
        quoteEl.textContent = sourceAdvice.innerText || sourceAdvice.textContent;
    }

    // 5. 应用色彩氛围
    const card = document.getElementById('share-card-area');
    if (card) {
        if (isXA) {
            card.style.borderColor = "rgba(0, 242, 234, 0.3)";
            card.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 242, 234, 0.1)";
        } else {
            card.style.borderColor = "rgba(247, 37, 133, 0.3)";
            card.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(247, 37, 133, 0.1)";
        }
    }
}

window.goSharePage = function () {
    nextPage(12);
    setTimeout(renderFinalReport, 100);
}
function showResultsOld() {
    nextPage(11); // 切换至流程中的第 11 页：核心结果页

    // 填充分数与标签 (Y1/Y2)
    document.getElementById('y1-score').textContent = userData.y1.toFixed(2);
    document.getElementById('y2-score').textContent = userData.y2.toFixed(2);

    // 更新 Y1/Y2 比例条
    const yTotal = userData.y1 + userData.y2;
    const yRatio = (userData.y2 / yTotal) * 100;
    document.getElementById('y-ratio-bar').style.width = yRatio + '%';

    // 更新路径拟合文字
    const isXA = userData.xa >= userData.xb;
    document.getElementById('res-path-type').textContent = isXA ? "XA-M1-Y2 (深层认同)" : "XB-M2-Y1 (流量套利)";

    // 基于模式调整 P11 交互性
    const p11 = document.getElementById('page-11');
    const pathCard = document.getElementById('path-card');
    if (!isFastMode) {
        p11.classList.add('theory-mode');
        pathCard?.classList.add('interactive');
    } else {
        p11.classList.remove('theory-mode');
        pathCard?.classList.remove('interactive');
    }

    // 渲染图表 (必须在容器可见后渲染，否则 canvas 尺寸可能异常)
    renderRadarChart();

    // 生成建议
    generateAdvice();

    // 直观模式下的特别引导
    if (isFastMode) {
        const adviceContainer = document.querySelector('.advice-container');
        if (adviceContainer) {
            const hint = document.createElement('div');
            hint.className = 'intuitive-mode-hint mt-10 text-accent font-bold';
            hint.innerHTML = '<i class="fa-solid fa-sparkles mr-5"></i> 诊断已完成！已为您精简掉复杂的学术指标，请点击下方保存报告。';
            adviceContainer.prepend(hint);
        }
    }
}

function renderRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');

    const isXA = userData.xa >= userData.xb;
    const mapTo100 = (val) => Math.round(val);

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                ['情感动力', '(XA)'],
                ['高保真', '复制(M1)'],
                ['算法迎合', '(M3)'],
                ['平台驱动', '(XB)'],
                ['主体重构', '变异(M2)']
            ],
            datasets: [{
                label: '您的视频因子矩阵',
                data: [
                    isXA ? mapTo100(userData.xa) : 0, // 如果是 XB 驱动，XA 不计入矩阵
                    mapTo100(userData.m1),
                    mapTo100(userData.m3),
                    !isXA ? mapTo100(userData.xb) : 0, // 如果是 XA 驱动，XB 不计入矩阵
                    mapTo100(userData.m2)
                ],
                backgroundColor: 'rgba(247, 37, 133, 0.4)',
                borderColor: '#f72585',
                pointBackgroundColor: '#4cc9f0',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#4cc9f0',
                borderWidth: 2,
            }]
        },
        options: {
            layout: {
                padding: 30
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: {
                        color: 'rgba(255,255,255,0.8)',
                        font: { size: 10, family: 'Noto Sans SC' },
                        padding: 10
                    },
                    ticks: { display: false, min: 0, max: 100 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function getEnding() {
    const isXA = userData.xa >= userData.xb;
    const m1 = userData.m1;
    const m2 = userData.m2;
    const m3 = userData.m3;

    if (isXA) {
        // XA 路径：聚焦 1, 2, 3
        if (m1 < 70) {
            return { id: 2, name: "迷失自我的倒戈者", badge: "⚠️ 致命失误", color: "text-accent", desc: "你想求认同，手却不受控制去迎合反差。熟人觉得你变味了，你的圈层社交暗号已失效，内核稳定性 Y2 已丧失。" };
        } else if (m3 >= 70) {
            return { id: 3, name: "外挂加持的社交达人", badge: "SSR 全能", color: "text-purple", desc: "极致平衡的高手。保留了模因原汁原味的灵魂，同时利用算法规则实现跨圈层的高效传播，达成了双线走高。" };
        } else {
            return { id: 1, name: "完美的原教旨主义者", badge: "S 级认同", color: "text-blue", desc: "你的高保真复刻唤醒了圈层最深处的情绪记忆。即便没有全网大爆，但在垂直领域你已具备极高的心智护城河。" };
        }
    } else {
        // XB 路径：聚焦 4, 5, 6
        if (m2 >= 70 && m3 >= 70) {
            return { id: 4, name: "顶级流量收割机", badge: "S 级爆款", color: "text-purple", desc: "极致的职业反差与强烈的叙事重组，完美切中了算法的猎奇分发机制，是典型的表现型变异成功案例。" };
        } else if (m1 >= 70) {
            return { id: 5, name: "边缘化的拙劣模仿者", badge: "⚠️ 绝路", color: "text-accent", desc: "没有原生圈层的情感加持，却在流量赛道死板搬运。这种缺乏表现型创新的内容，难逃在首轮筛选中被淘汰的命运。" };
        } else {
            return { id: 6, name: "平稳的随大流者", badge: "中庸局", color: "text-secondary", desc: "缺乏极致的策略倾斜。所有数据和手段都停留在及格线，偶尔有播放却留不住人，逐渐淹没在短视频的汪洋大海中。" };
        }
    }
}

function generateAdvice() {
    const container = document.getElementById('advice-content');

    // 生成对应结局并存入全局数据
    const ending = getEnding();
    userData.ending = ending;

    let adviceHtml = `<div class="advice-block">
        <div class="mb-5 border-b pb-5" style="border-color: rgba(255,255,255,0.1)">
            已锁定您在 6 大生态位归宿中的位置：
        </div>
        <div class="mt-15 mb-10 flex align-center">
            <span class="${ending.color} font-bold text-sm"><i class="fa-solid fa-flag-checkered mr-5"></i> 结局 ${ending.id}：${ending.name}</span>
            <span class="badge ml-10 text-xs" style="background: rgba(255,255,255,0.15); padding: 2px 6px;">${ending.badge}</span>
        </div>
        <p class="opacity-80 line-height-lg text-xs" style="color: #ccc;">${ending.desc}</p>
    </div>`;

    container.innerHTML = adviceHtml;
}

// 填充 P13 (已重命名为 P12) 长图报告数据
function populateFinalReport() {
    const isXA = userData.xa >= userData.xb;
    const baseType = isXA ? "XA 心理驱动" : "XB 平台驱动";

    // 生成动态专属流水号与时间戳
    const randomHash = Math.floor(Math.random() * 90000 + 10000);
    userData.randomId = `MG - ${randomHash} -${isXA ? 'A' : 'B'} `;

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} `;
    document.getElementById('report-date').textContent = dateStr;

    // 初始化化创作者名称
    const customInput = document.getElementById('custom-id-input');
    updateReportID(customInput.value);

    // 直接在 P12 报告头部打上结局烙印
    document.getElementById('final-driver-type').innerHTML = `【${baseType}】&nbsp;|&nbsp; 达成结局 <span class="${userData.ending.color}">No.${userData.ending.id} ${userData.ending.name}</span>`;

    // Data is already strictly 0-100
    const p1 = userData.m1;
    const p2 = userData.m2;
    const p3 = userData.m3;

    // 填充数值
    document.getElementById('final-m1-val').textContent = p1.toFixed(2) + '%';
    document.getElementById('final-m2-val').textContent = p2.toFixed(2) + '%';
    document.getElementById('final-m3-val').textContent = p3.toFixed(2) + '%';

    document.getElementById('final-y1-score').textContent = userData.y1.toFixed(2);
    document.getElementById('final-y2-score').textContent = Math.min(99.99, userData.y2).toFixed(2);

    document.getElementById('report-date').textContent = new Date().toLocaleDateString();

    // 动画显示 DNA Bar
    setTimeout(() => {
        document.getElementById('dna-m1').style.width = p1 + '%';
        document.getElementById('dna-m2').style.width = p2 + '%';
        document.getElementById('dna-m3').style.width = p3 + '%';
    }, 100);
}

// 保存为图片 (高质量移动端适配版)
function saveToImage() {
    const element = document.getElementById('report-snapshot');
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在合成专属大图...';

    // 适配移动端截图：取消 allowTaint 防止画布污染，改为弹窗长按保存模式 (微信/苹果系统推荐模式)
    html2canvas(element, {
        backgroundColor: '#0d0d16',
        scale: window.devicePixelRatio > 1 ? 2 : 3, // 动态缩放控制内存限制
        useCORS: true,
        allowTaint: false,
        logging: false
    }).then(canvas => {
        try {
            // 尝试转为 base64
            const dataUrl = canvas.toDataURL('image/png');

            // 尝试触发自动下载 (PC 或 安卓Chrome 支持较好)
            const link = document.createElement('a');
            link.download = `MemeGravity_Report_${new Date().getTime()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 无论下载是否被拦截，都弹出一个全屏弹窗供用户手动长按保存 (防拦截终极方案)
            showImageOverlay(dataUrl);

        } catch (err) {
            console.warn("数据流导出失败(可能是本地file调试限制):", err);
            // 如果是在本地电脑双击打开的HTML，toDataURL会报安全错误。系统直接挂载原生 Canvas
            showCanvasOverlay(canvas);
        }

        btn.innerHTML = '<i class="fa-solid fa-check"></i> 报告已生成';
        setTimeout(() => btn.innerHTML = originalText, 3000);

    }).catch(err => {
        console.error("html2canvas engine error:", err);
        alert("由于设备性能限制，海报生成超时，请尝试系统自带截图功能。");
        btn.innerHTML = originalText;
    });
}

// 移动端/微信 防拦截兼容弹窗：展示 Base64 图片
function showImageOverlay(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,11,20,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';

    const hint = document.createElement('div');
    hint.innerHTML = '<i class="fa-solid fa-arrow-down mr-5"></i>如未自动下载，请长按下方海报【保存到相册】';
    hint.style.cssText = 'color:#00f2ea;text-align:center;font-size:13px;margin-bottom:20px;background:rgba(0,242,234,0.1);padding:10px 20px;border-radius:20px;border:1px solid rgba(0,242,234,0.3);';

    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width:90%;max-height:75vh;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.8);border:2px solid rgba(255,255,255,0.1);user-select:none;-webkit-touch-callout:default;';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark mr-5"></i>返回系统';
    closeBtn.style.cssText = 'margin-top:25px;padding:12px 30px;border-radius:30px;background:linear-gradient(45deg, #f72585, #7209b7);color:#fff;border:none;font-weight:bold;box-shadow:0 4px 15px rgba(247,37,133,0.4);';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    overlay.appendChild(hint);
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
}

// 本地 file:// 协议调试专属兼容弹窗：直接展示 Canvas 物理节点
function showCanvasOverlay(canvas) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,11,20,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';

    const hint = document.createElement('div');
    hint.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-5"></i>本地调试模式拦截了下载功能<br>请右键直接保存下方图片';
    hint.style.cssText = 'color:#f72585;text-align:center;font-size:12px;margin-bottom:20px;line-height:1.6;background:rgba(247,37,133,0.1);padding:10px 20px;border-radius:20px;border:1px solid rgba(247,37,133,0.3);';

    canvas.style.cssText = 'max-width:90%;height:auto;max-height:70vh;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.8);';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '确 认';
    closeBtn.style.cssText = 'margin-top:25px;padding:10px 30px;border-radius:30px;background:#333;color:#fff;border:none;';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    overlay.appendChild(hint);
    overlay.appendChild(canvas);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
}

// -----------------------------------------
// P1 入场与创作者身份锁定逻辑
// -----------------------------------------
function showProfileSetup() {
    const hero = document.getElementById('p1-main-hero');
    const card = document.getElementById('p1-profile-card');

    // 隐藏主标题
    hero.classList.add('hero-hidden');

    // 延迟显示身份卡片以配合动画
    setTimeout(() => {
        card.style.display = 'block';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    }, 400);
}

function confirmProfileAndStart() {
    const name = document.getElementById('custom-id-input').value.trim();
    if (!name) {
        alert("请输入您的创作者代号，系统将为您生成专属档案。");
        return;
    }
    // 进入 Page 2
    nextPage(2);
}

function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 更新首页预览
            document.getElementById('avatar-preview').src = e.target.result;
            // 同步更新报告头像
            const reportAvatar = document.getElementById('report-avatar');
            if (reportAvatar) reportAvatar.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function updateReportID(val) {
    const displayElement = document.getElementById('report-id-tag');
    if (!displayElement) return;
    if (!val || val.trim() === '') {
        displayElement.textContent = userData.randomId ? `ID: ${userData.randomId} ` : 'ID: UNKNOWN';
    } else {
        displayElement.textContent = `创作者：${val} `;
    }
}

// -----------------------------------------
// P4 AUDIT: 驱动力评议动态加载逻辑 (100%版)
// -----------------------------------------
function triggerP4Audit() {
    // 触发进度条 CSS 动画
    const xaFill = document.getElementById('p4-xa-fill');
    const xbFill = document.getElementById('p4-xb-fill');

    if (xaFill && xbFill) {
        xaFill.style.width = '0%';
        xbFill.style.width = '0%';
        xaFill.offsetHeight; // 强制重绘

        setTimeout(() => {
            xaFill.style.width = '100%';
            xbFill.style.width = '100%';
        }, 100);
    }
}

// -----------------------------------------
// P5 VISIBILITY ATOMIC FIX: 强制进入答题页
// -----------------------------------------
function forceGoToP5() {
    console.log("Forcing P5 Visibility...");

    // 1. 强力隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
        p.style.opacity = '0';
        p.style.visibility = 'hidden';
    });

    // 2. 强力展示 P5
    const p5 = document.getElementById('page-5');
    if (p5) {
        p5.style.display = 'flex';
        p5.style.opacity = '1';
        p5.style.visibility = 'visible';
        p5.classList.add('active');
        p5.classList.remove('slide-out');

        // 3. 强制恢复 Question 1
        const q1 = document.getElementById('q1');
        if (q1) {
            document.querySelectorAll('.quiz-step').forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active', 'exit-left', 'locked');
            });
            q1.style.display = 'flex';
            q1.classList.add('active');
        }

        // 4. 环境光重置
        p5.classList.add('quiz-step-1');
    }

    // 5. 进度条重置
    document.querySelectorAll('.step-unit').forEach(u => u.classList.remove('active', 'completed'));
    const s1 = document.getElementById('p5-step-1');
    if (s1) s1.classList.add('active');

    // 渲染背景 (防止资源加载阻塞)
    const bg = document.getElementById('background-container');
    if (bg) bg.style.display = 'block';
}

// 刷相似视频
function openSimilarVideos() {
    // 模拟搜索关键词：基于驱动类型推荐
    const keyword = userData.xa >= userData.xb ? "治愈系原声" : "热门转场挑战";
    window.open(`https://www.douyin.com/search/${encodeURIComponent(keyword)}`, '_blank');
}

// 通用的数字滚动辅助函数 (仍为其他页面保留，或按需清理)
function animateNumber(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = (progress * (end - start)) + start;
        obj.innerHTML = current.toFixed(1);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ==========================================
// 调试工具逻辑
// ==========================================
function toggleDebugMenu() {
    const menu = document.getElementById('debug-menu');
    console.log('Toggling debug menu:', menu);
    if (menu) menu.classList.toggle('active');
}

function debugJump(page) {
    console.log('Jumping to page:', page);
    if (typeof nextPage === 'function') {
        nextPage(page);
        toggleDebugMenu();
    } else {
        console.error('nextPage function not found!');
    }
}

// ==========================================
// 结局解读工具：分数详情弹窗
// ==========================================
const scoreDefinitions = {
    'y1': {
        icon: '<i class="fa-solid fa-eye text-primary"></i>',
        title: '躯壳魅力 (Y1) 指数',
        formula: 'Y1 = [M2 * W_m2] + [M3 * W_m3] * (1 + XB_boost)',
        desc: '衡量视频的表现力与吸粉能力。基于您在表现型层面的“魔改”创新程度（M2）与对流量平台的算法适配（M3）计算得出。'
    },
    'y2': {
        icon: '<i class="fa-solid fa-gem text-accent"></i>',
        title: '内核韧性 (Y2) 指数',
        formula: 'Y2 = [M1 * W_m1] * (1 + XA_boost) + Engagement_Factor',
        desc: '衡量视频的情绪共鸣力与社交留存率。基于内容的基因型还原度（M1）与您作为创作者的心理驱动感（XA）深度拟合偏解。'
    },
    'm1': {
        icon: '<i class="fa-solid fa-dna text-blue"></i>',
        title: '基因型复刻度 (M1)',
        formula: 'M1 = Σ(情绪+节奏+逻辑) / 3',
        desc: '反映您对爆款种子“生命指纹”的精确还原。它是心理驱动型创作者（XA）触发社群共振的基础底盘。'
    },
    'm2': {
        icon: '<i class="fa-solid fa-shuffle text-magenta"></i>',
        title: '表现型变异度 (M2)',
        formula: 'M2 = Σ(身份+场景+诉求) / 3',
        desc: '反映您在模仿过程中的二次创作能力。高分代表了强烈的身份反差与场景重组，是平台驱动型创作者（XB）破圈的核心。'
    },
    'm3': {
        icon: '<i class="fa-solid fa-hashtag text-purple"></i>',
        title: '算法适配度 (M3)',
        formula: 'M3 = Σ(标签+埋梗+预判) / 3',
        desc: '反映内容与短视频平台（如抖音）推荐算法的动态契合度，决定了系统将模因推向更大流量池的效率。'
    }
};

function showScoreDetail(type) {
    // 仅在“原理模式”下生效
    if (isFastMode) return;

    const isXA = userData.xa >= userData.xb;
    let data = { ...scoreDefinitions[type] };

    // 动态代入真实权重公式 (基于 startAnalysis 中的逻辑)
    if (type === 'y1') {
        data.formula = isXA ?
            `Y1 = 45 + (M2 * 0.3337) + (M3 * 0.1974)` :
            `Y1 = 10 + (M1 * 0.2556) + (M2 * 0.4755) + (M3 * 0.1551)`;
        data.desc += ` (当前判定为：${isXA ? 'XA 心理驱动路径' : 'XB 平台驱动路径'})`;
    } else if (type === 'y2') {
        data.formula = isXA ?
            `Y2 = 45 + (M1 * 0.3934) + (M3 * 0.2556)` :
            `Y2 = 15 + (M1 * 0.4941) + (M2 * 0.1604) + (M3 * 0.1629)`;
        data.desc += ` (当前判定为：${isXA ? 'XA 心理驱动路径' : 'XB 平台驱动路径'})`;
    }

    if (!data) return;

    document.getElementById('modal-icon-box').innerHTML = data.icon;
    document.getElementById('modal-title-text').textContent = data.title;
    document.getElementById('modal-formula-text').textContent = data.formula;
    document.getElementById('modal-desc-text').textContent = data.desc;

    const overlay = document.getElementById('score-modal');
    overlay.classList.add('active');
}


function hideScoreModal() {
    document.getElementById('score-modal').classList.remove('active');
}

// -----------------------------------------
// 路径模式详解：基于 PROCESS Model 4 的推演 (折叠面板版)
// -----------------------------------------
function togglePathDetail() {
    // 仅在“原理模式”下生效
    if (isFastMode) return;

    const content = document.getElementById('path-detail-content');
    const isXA = userData.xa >= userData.xb;

    if (content.classList.contains('active')) {
        content.classList.remove('active');
    } else {
        const text = isXA ?
            `<strong>XA 心理驱动路径：</strong><br>主公式：XA → M1 → Y2。内容深度依赖“情绪共鸣”。通过精准还原底层逻辑（M1），能有效触发圈层认同，由于不依赖变异，内核韧性（Y2）极高。` :
            `<strong>XB 平台驱动路径：</strong><br>主公式：XB → M2 → Y1。内容依赖“流量套利”。通过大胆的叙事魔改（M2），利用算法的新鲜感推荐机制实现破圈，表现型魅力（Y1）是核心产出。`;

        content.innerHTML = text;
        content.classList.add('active');
    }
}

// -----------------------------------------
// 极速模式：解锁原理模式
// -----------------------------------------
function unlockTheoryMode() {
    isFastMode = false;
    // 重新调用 showResults 会帮我们更新 classes 和交互
    showResults();
}

