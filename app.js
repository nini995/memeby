// ==========================================
// 短视频爆款模仿策略导航仪 - 核心逻辑
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

// 测评状态
let quizData = {
    xa: 0,
    xb: 0,
    currentStep: 1,
    totalSteps: 3
};

// 重新启动整个诊断系统，清空所有历史数据缓存
function restartApp() {
    userData = { xa: 0, xb: 0, m1: 0, m2: 0, m3: 0, y1: 0, y2: 0 };
    quizData = { xa: 0, xb: 0, currentStep: 1, totalSteps: 3 };

    // 恢复测评 UI 初始态
    document.getElementById('q1').classList.add('active');
    document.getElementById('q2').classList.remove('active');
    document.getElementById('q3').classList.remove('active');
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-progress-ui').style.display = 'flex';
    document.getElementById('quiz-idx').textContent = '1';

    // 将所有滑块重置为默认值 50%
    ['m1', 'm2', 'm3'].forEach(prefix => {
        ['1', '2', '3'].forEach(suffix => {
            const slider = document.getElementById(`${prefix}_${suffix}`);
            if (slider) slider.value = 50;
        });
    });

    nextPage(1);
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

    if (currentActive) {
        currentActive.classList.remove('active', 'animate-up');
        currentActive.classList.add('slide-out');
    }

    next.classList.remove('slide-out');
    next.classList.add('active');

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
        currentActive.classList.remove('active', 'animate-up', 'slide-out');
    }

    prev.classList.add('active');
    prev.classList.add('animate-up');

    // 针对特定页面的背景切换逻辑 (同步更新背景)
    const bgContainer = document.getElementById('particles-js');
    if (pageIndex === 1 || pageIndex === 2) {
        bgContainer.classList.add('bg-vibe-1');
        bgContainer.classList.remove('bg-vibe-2');
    } else if (pageIndex === 3) {
        bgContainer.classList.add('bg-vibe-2');
        bgContainer.classList.remove('bg-vibe-1');
    } else {
        bgContainer.classList.remove('bg-vibe-1', 'bg-vibe-2');
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

// 实时更新审计页面的 UI 反馈
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
            message = "🚀 状态拉满！深度适配算法环境，您正处于流量爆发的前夕。";
            statusClass = "good";
        } else if (total > 100) {
            message = "🔹 稳定：基础适配度良好，符合平台分发逻辑。";
            statusClass = "info";
        } else {
            message = "📈 建议：提升标签精准度与互动引导，这部分分值越高，自然流分发越广。";
            statusClass = "warning";
        }
    }

    if (feedback) {
        if (prefix === 'm3') {
            // P8 保留数值实时变化即可，已经在 monitor-line 实现
        } else {
            feedback.innerHTML = `<div class="feedback-box ${statusClass}">${message}</div>`;
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
    nextPage('5-result');

    // 3. 将测评结果映射到实际审计值 (赋值备份)
    userData.xa_result = userData.xa;
    userData.xb_result = userData.xb;
}


// 启动分析与加载动画
function startAnalysis() {
    nextPage(10); // 切换至流程中的第 10 页：过度动画页

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

    // 核心理论约束：M1(高保真复制)与M2(同构异义变异)是此消彼长的两端
    // 强制归一化 M1 和 M2 的占比，使其加起来为 100%
    const totalM1M2 = rawM1 + rawM2;
    let normM1 = 50;
    let normM2 = 50;
    if (totalM1M2 > 0) {
        normM1 = (rawM1 / totalM1M2) * 100;
        normM2 = (rawM2 / totalM1M2) * 100;
    }

    // 直接采用 0-100 的基准数值进行底层映射计算，放大效应差
    userData.xa = (userData.xa / 15) * 100;
    userData.xb = (userData.xb / 15) * 100;

    userData.m1 = normM1;
    userData.m2 = normM2;
    userData.m3 = rawM3;

    // ==============================================
    // 基于论文最新路径系数计算结果 (2026版模型)
    // ==============================================

    // 依据论文 PROCESS Model 4 平行中介效应数据 (表4-4至4-9)
    let m1 = userData.m1;
    let m2 = userData.m2;
    let m3 = userData.m3;
    let y1, y2;

    if (userData.xa >= userData.xb) {
        // 心理驱动(XA) 模型: Y1 直接效应=0.5356; 间接M2=0.3337; 间接M3=0.1974; M1不显著
        // Y2 直接效应=0.4080; 间接M1=0.3934; 间接M3=0.2556; M2不显著
        y1 = 45 + (m2 * 0.3337) + (m3 * 0.1974);
        y2 = 45 + (m1 * 0.3934) + (m3 * 0.2556);
    } else {
        // 平台驱动(XB) 模型: Y1 直接效应=不显著(0.0208); 间接M1=0.2556; 间接M2=0.4755; 间接M3=0.1551
        // Y2 直接效应=0.1612; 间接M1=0.4941; 间接M2=0.1604; 间接M3=0.1629
        y1 = 10 + (m1 * 0.2556) + (m2 * 0.4755) + (m3 * 0.1551);
        y2 = 15 + (m1 * 0.4941) + (m2 * 0.1604) + (m3 * 0.1629);
    }

    userData.y1 = Math.min(y1, 99.99);
    userData.y2 = Math.min(y2, 99.99);

    // 运行打字机效果模拟控制台
    simulateProcessing();
}

function simulateProcessing() {
    const logs = [
        "正在初始化「短视频爆款模仿策略导航仪」诊断引擎 v3.0...",
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

    // 渲染图表
    renderRadarChart();

    // 生成建议
    generateAdvice();
}

function renderRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');

    // 已经是 0-100 范围，直接取整展示
    const mapTo100 = (val) => Math.round(val);

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                ['情感动力', '(XA)'],
                ['高保真', '复制(M1)'],
                ['算法迎合', '(M3)'],
                ['平台驱动', '(XB)'],
                ['同构异义', '变异(M2)']
            ],
            datasets: [{
                label: '您的视频因子矩阵',
                data: [
                    mapTo100(userData.xa),
                    mapTo100(userData.m1),
                    mapTo100(userData.m3),
                    mapTo100(userData.xb),
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
        if (m2 >= 60) return { id: 2, name: "迷失自我的倒戈者", badge: "⚠️ 致命失误", color: "text-accent", desc: "你想求认同，手却不受控制去迎合反差。熟人觉得你变味了，你的圈层社交暗号已失效，只留下了虚高的无价值点赞。" };
        if (m3 >= 70 && m1 > 40) return { id: 3, name: "外挂加持的社交达人", badge: "SSR 全能", color: "text-purple", desc: "你保留了内容的原汁原味，同时熟练运用平台标签与互动机制，成功将圈子里的小众情绪推向了大众高潮。" };
        return { id: 1, name: "完美的原教旨主义者", badge: "S 级认同", color: "text-blue", desc: "你的高保真复刻唤醒了圈层最深处的情绪记忆。即便你没有引发全网热捧甚至爆红，但你在你的小众群体里已然封神。" };
    } else {
        if (m2 >= 60) return { id: 4, name: "顶级流量收割机", badge: "S 级爆款", color: "text-purple", desc: "极致的职业反差与强烈的叙事重组，完美切中了算法的猎奇机制，你是真正懂流量密码的变种人。" };
        if (m1 >= 60) return { id: 5, name: "边缘化的拙劣模仿者", badge: "⚠️ 绝路", color: "text-accent", desc: "没有原生圈层的情感加持，却还在死板搬运。这种极度缺乏表现力的敷衍内容，很快就会被一池流量筛选淘汰。" };
        return { id: 6, name: "平稳的随大流者", badge: "中庸局", color: "text-secondary", desc: "缺乏极致的策略倾斜。所有数据和手段都停留在及格线，偶尔有播放却留不住人，逐渐淹没在短视频的汪洋大海中。" };
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
    userData.randomId = `MG-${randomHash}-${isXA ? 'A' : 'B'}`;

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
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
        displayElement.textContent = userData.randomId ? `ID: ${userData.randomId}` : 'ID: UNKNOWN';
    } else {
        displayElement.textContent = `创作者：${val}`;
    }
}

// -----------------------------------------
// P4 AUDIT: 驱动力审计动态加载逻辑 (100%版)
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
