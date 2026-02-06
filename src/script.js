import './style.css'
import Experience from './Experience/Experience.js'

function init() {
    const targetElement = document.querySelector('.experience')
    if (!targetElement) {
        console.warn('init: .experience not found')
        return
    }

    window.experience = new Experience({ targetElement })
    if (!window.experience.targetElement) return

    const hint = document.getElementById('hint')
    const modalOverlay = document.getElementById('modalOverlay')
    const modalClose = document.getElementById('modalClose')
    const projectsTitle = document.getElementById('projectsTitle')
    const projectsSubtitle = document.getElementById('projectsSubtitle')
    const projectsGrid = document.getElementById('projectsGrid')

    const projectsConfig = {
        pcScreen: {
            title: 'About Me',
            subtitle: '一些关于我的链接',
            cards: [
                {
                    href: 'https://blog.linhk.top',
                    img: '/imgs/Cover-Keyboard.jpg',
                    title: '个人博客',
                    desc: '记录技术与生活的博客 · blog.linhk.top'
                },
                {
                    href: '/',
                    img: '/imgs/Cover-Questopia.jpg',
                    title: '主页',
                    desc: '返回本站首页或个人主页'
                }
            ]
        },
        macScreen: {
            title: '实用工具',
            subtitle: '开发和效率相关的小工具',
            cards: [
                {
                    href: 'https://excalidraw.com/',
                    img: '/imgs/vue-chemistry.jpg',
                    title: 'Excalidraw',
                    desc: '手绘风白板 · 画原型/草图'
                },
                {
                    href: 'https://carbon.now.sh/',
                    img: '/imgs/Cover-Pkg.jpg',
                    title: 'Carbon',
                    desc: '将代码片段导出为漂亮图片'
                },
                {
                    href: 'https://codepen.io/',
                    img: '/imgs/Cover-hyper.jpg',
                    title: 'CodePen',
                    desc: '在线前端实验与分享'
                }
            ]
        },
        tv: {
            title: '我的网站',
            subtitle: '一些想推荐给你的站点',
            cards: [
                {
                    href: '/emulator.html',
                    img: '/imgs/Cover-KOB.jpg',
                    title: '马里奥游戏',
                    desc: 'Super Mario Advance 4 · GBA 模拟器'
                },
                {
                    href: 'https://github.com/',
                    img: '/imgs/Cover-Artstation.jpg',
                    title: 'GitHub',
                    desc: '开源代码托管与协作平台'
                },
                {
                    href: 'https://developer.mozilla.org/',
                    img: '/imgs/Cover-Archimason.jpg',
                    title: 'MDN Web Docs',
                    desc: 'Web 开发文档与示例'
                }
            ]
        }
    }

    function renderProjects(state) {
        if (!projectsGrid) return
        const config = projectsConfig[state]
        if (!config) return

        if (projectsTitle) projectsTitle.textContent = config.title
        if (projectsSubtitle) projectsSubtitle.textContent = config.subtitle

        projectsGrid.innerHTML = config.cards.map((card) => `
            <a href="${card.href}" class="card" target="_blank" rel="noopener">
              <img src="${card.img}" class="img" alt="" />
              <div class="description">
                <h3>${card.title}</h3>
                <p>${card.desc}</p>
              </div>
            </a>
        `).join('')
    }

    function openModal(state) {
        renderProjects(state)
        if (modalOverlay) {
            modalOverlay.classList.add('visible')
            modalOverlay.setAttribute('aria-hidden', 'false')
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('visible')
            modalOverlay.setAttribute('aria-hidden', 'true')
        }
    }

    function onStateChange(state) {
        if (state === 'default') {
            if (hint) hint.classList.add('is-visible')
            closeModal()
        } else {
            if (hint) hint.classList.remove('is-visible')
            openModal(state)
        }
    }

    function dismissModal() {
        if (window.experience && window.experience.navigation) {
            window.experience.navigation.goToDefault()
        }
        closeModal()
    }

    if (modalClose) {
        modalClose.addEventListener('click', dismissModal)
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) dismissModal()
        })
    }

    if (window.experience.navigation) {
        window.experience.navigation.onViewStateChange = onStateChange
        onStateChange(window.experience.navigation.viewState)
    }

    const devPanel = document.getElementById('devPanel')
    const devPanelToggle = document.getElementById('devPanelToggle')
    if (devPanel && devPanelToggle) {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data && data.showSettings) {
                    devPanelToggle.checked = true
                    if (window.experience && typeof window.experience.setDebugPanelVisible === 'function') {
                        window.experience.setDebugPanelVisible(true)
                    }
                }
            })
            .catch(() => {})
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault()
                devPanel.classList.toggle('is-visible')
                devPanel.setAttribute('aria-hidden', devPanel.classList.contains('is-visible') ? 'false' : 'true')
            }
        })
        devPanelToggle.addEventListener('change', () => {
            const checked = devPanelToggle.checked
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showSettings: checked }),
            }).catch(() => {})
            if (window.experience && typeof window.experience.setDebugPanelVisible === 'function') {
                window.experience.setDebugPanelVisible(checked)
            }
        })
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

