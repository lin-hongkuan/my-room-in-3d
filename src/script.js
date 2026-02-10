import './style.css'
import Experience from './Experience/Experience.js'

const AudioManager = (() => {
    let bgm = null
    let clickAudio = null
    let clickReady = false
    let bgmReady = false
    let audioCtx = null

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioCtx.state === 'suspended') audioCtx.resume()
        return audioCtx
    }

    function initBGM() {
        bgm = document.createElement('audio')
        bgm.src = '/audio/bgm.mp3'
        bgm.loop = true
        bgm.volume = 0.3
        bgm.preload = 'auto'
        bgm.addEventListener('canplaythrough', () => { bgmReady = true }, { once: true })
        bgm.addEventListener('error', () => { bgmReady = false })
    }

    let synthBgmPlaying = false
    let synthBgmNodes = null

    function startSynthBGM() {
        if (synthBgmPlaying) return
        const ctx = getAudioContext()
        
        const masterGain = ctx.createGain()
        masterGain.gain.value = 0.15
        masterGain.connect(ctx.destination)

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 800
        filter.Q.value = 1
        filter.connect(masterGain)

        // Am - F - C - G chord progression (frequencies in Hz)
        const chords = [
            [220, 261.63, 329.63],
            [174.61, 220, 261.63],
            [261.63, 329.63, 392],
            [196, 246.94, 293.66]
        ]
        
        let chordIndex = 0
        const oscillators = []
        const gains = []

        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = chords[0][i]
            gain.gain.value = 0.3
            osc.connect(gain)
            gain.connect(filter)
            osc.start()
            oscillators.push(osc)
            gains.push(gain)
        }

        const chordInterval = setInterval(() => {
            chordIndex = (chordIndex + 1) % chords.length
            const t = ctx.currentTime
            oscillators.forEach((osc, i) => {
                osc.frequency.setTargetAtTime(chords[chordIndex][i], t, 0.1)
            })
        }, 2000)

        synthBgmNodes = { masterGain, filter, oscillators, gains, chordInterval }
        synthBgmPlaying = true
    }

    function stopSynthBGM() {
        if (!synthBgmPlaying || !synthBgmNodes) return
        clearInterval(synthBgmNodes.chordInterval)
        synthBgmNodes.oscillators.forEach(osc => {
            try { osc.stop() } catch (_) {}
        })
        synthBgmNodes = null
        synthBgmPlaying = false
    }

    function toggleBGM() {
        getAudioContext()
        
        if (!bgm) initBGM()
        
        if (bgm.paused) {
            const playPromise = bgm.play()
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    stopSynthBGM()
                }).catch(() => {
                    startSynthBGM()
                })
            }
            return true
        } else {
            bgm.pause()
            stopSynthBGM()
            return false
        }
    }

    function initClick() {
        clickAudio = new Audio('/audio/click.mp3')
        clickAudio.volume = 0.5
        clickAudio.preload = 'auto'
        clickAudio.addEventListener('canplaythrough', () => { clickReady = true }, { once: true })
        clickAudio.addEventListener('error', () => { clickReady = false })
    }

    function synthClick() {
        try {
            const ctx = getAudioContext()
            const t = ctx.currentTime

            const osc1 = ctx.createOscillator()
            const gain1 = ctx.createGain()
            osc1.type = 'sine'
            osc1.frequency.setValueAtTime(880, t)
            osc1.frequency.exponentialRampToValueAtTime(1320, t + 0.05)
            gain1.gain.setValueAtTime(0.12, t)
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
            osc1.connect(gain1)
            gain1.connect(ctx.destination)
            osc1.start(t)
            osc1.stop(t + 0.1)

            const osc2 = ctx.createOscillator()
            const gain2 = ctx.createGain()
            osc2.type = 'triangle'
            osc2.frequency.setValueAtTime(1760, t)
            osc2.frequency.exponentialRampToValueAtTime(2200, t + 0.03)
            gain2.gain.setValueAtTime(0.05, t)
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.start(t)
            osc2.stop(t + 0.06)
        } catch (_) {}
    }

    function playClick() {
        if (clickReady && clickAudio) {
            clickAudio.currentTime = 0
            clickAudio.play().catch(() => synthClick())
        } else {
            synthClick()
        }
    }

    initBGM()
    initClick()

    return { toggleBGM, playClick }
})()

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
    const audioToggle = document.getElementById('audioToggle')
    const projectsTitle = document.getElementById('projectsTitle')
    const projectsSubtitle = document.getElementById('projectsSubtitle')
    const projectsIntro = document.getElementById('projectsIntro')
    const projectsGrid = document.getElementById('projectsGrid')

    const projectsConfig = {
        pcScreen: {
            title: 'About Me',
            subtitle: '一些关于我的链接',
            intro: '喜欢写代码和做 3D 小项目，这个房间是用 Three.js 搭的。博客里会记一些技术笔记和日常。',
            cards: [
                {
                    href: '/sites/blog.html',
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
                    href: '/sites/excalidraw.html',
                    img: '/imgs/vue-chemistry.jpg',
                    title: 'Excalidraw',
                    desc: '手绘风白板 · 画原型/草图'
                },
                {
                    href: '/sites/carbon.html',
                    img: '/imgs/Cover-Pkg.jpg',
                    title: 'Carbon',
                    desc: '将代码片段导出为漂亮图片'
                },
                {
                    href: '/sites/codepen.html',
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
                    href: '/sites/github.html',
                    img: '/imgs/Cover-Artstation.jpg',
                    title: 'GitHub',
                    desc: '开源代码托管与协作平台'
                },
                {
                    href: '/sites/mdn.html',
                    img: '/imgs/Cover-Archimason.jpg',
                    title: 'MDN Web Docs',
                    desc: 'Web 开发文档与示例'
                }
            ]
        },
        bookshelf: {
            title: '书影音',
            subtitle: '我喜欢的书籍、电影和音乐',
            cards: [
                {
                    href: '/sites/douban-books.html',
                    img: '/imgs/Cover-Keyboard.jpg',
                    title: '豆瓣读书',
                    desc: '发现好书 · 记录阅读'
                },
                {
                    href: '/sites/douban-movies.html',
                    img: '/imgs/Cover-KOB.jpg',
                    title: '豆瓣电影',
                    desc: '电影评分与影评社区'
                },
                {
                    href: '/sites/netease-music.html',
                    img: '/imgs/Cover-hyper.jpg',
                    title: '网易云音乐',
                    desc: '发现音乐 · 分享感动'
                },
                {
                    href: '/sites/bilibili.html',
                    img: '/imgs/Cover-Questopia.jpg',
                    title: 'Bilibili',
                    desc: '视频弹幕网站 · 学习娱乐'
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
        if (projectsIntro) {
            if (config.intro) {
                projectsIntro.textContent = config.intro
                projectsIntro.style.display = ''
            } else {
                projectsIntro.textContent = ''
                projectsIntro.style.display = 'none'
            }
        }

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
            AudioManager.playClick()
            openModal(state)
        }
    }

    function dismissModal() {
        if (window.experience && window.experience.navigation) {
            window.experience.navigation.goToDefault()
        }
        closeModal()
    }

    if (audioToggle) {
        const handleAudioToggle = (e) => {
            e.preventDefault()
            e.stopPropagation()
            const playing = AudioManager.toggleBGM()
            if (playing) {
                audioToggle.classList.add('is-playing')
            } else {
                audioToggle.classList.remove('is-playing')
            }
            AudioManager.playClick()
        }
        audioToggle.addEventListener('click', handleAudioToggle)
        audioToggle.addEventListener('touchend', handleAudioToggle)
    }

    if (modalClose) {
        const handleClose = (e) => {
            e.preventDefault()
            AudioManager.playClick()
            dismissModal()
        }
        modalClose.addEventListener('click', handleClose)
        modalClose.addEventListener('touchend', handleClose)
    }

    if (modalOverlay) {
        const handleOverlayClose = (e) => {
            if (e.target === modalOverlay) {
                e.preventDefault()
                AudioManager.playClick()
                dismissModal()
            }
        }
        modalOverlay.addEventListener('click', handleOverlayClose)
        modalOverlay.addEventListener('touchend', handleOverlayClose)
    }

    if (window.experience.navigation) {
        window.experience.navigation.onViewStateChange = onStateChange
        onStateChange(window.experience.navigation.viewState)
    }

    const devPanel = document.getElementById('devPanel')
    const devPanelToggle = document.getElementById('devPanelToggle')
    if (devPanel && devPanelToggle) {
        let currentSettings = { showSettings: false, preset: null }

        const debounce = (func, wait) => {
            let timeout
            return (...args) => {
                clearTimeout(timeout)
                timeout = setTimeout(() => func.apply(this, args), wait)
            }
        }

        const saveSettings = debounce(() => {
            if (window.experience && typeof window.experience.getSettings === 'function') {
                const preset = window.experience.getSettings()
                if (preset) currentSettings.preset = preset
            }
            currentSettings.showSettings = devPanelToggle.checked

            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSettings),
            }).catch(() => {})
        }, 1000)

        // 绑定 Experience 的回调
        if (window.experience) {
            window.experience.onSettingsChange = saveSettings
        }

        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data) {
                    currentSettings = data
                    if (data.showSettings) {
                        devPanelToggle.checked = true
                        if (window.experience && typeof window.experience.setDebugPanelVisible === 'function') {
                            window.experience.setDebugPanelVisible(true)
                        }
                    }
                    if (data.preset && window.experience && typeof window.experience.setSettings === 'function') {
                        window.experience.setSettings(data.preset)
                    }
                }
            })
            .catch(() => {})

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'F12') {
                e.preventDefault()
                devPanel.classList.toggle('is-visible')
                devPanel.setAttribute('aria-hidden', devPanel.classList.contains('is-visible') ? 'false' : 'true')
            }
        })
        devPanelToggle.addEventListener('change', () => {
            const checked = devPanelToggle.checked
            if (window.experience && typeof window.experience.setDebugPanelVisible === 'function') {
                window.experience.setDebugPanelVisible(checked)
            }
            saveSettings()
        })
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
