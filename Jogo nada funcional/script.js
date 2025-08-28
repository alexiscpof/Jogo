document.addEventListener('DOMContentLoaded', () => {
    const quadradinhos = document.querySelectorAll(".grid div")
    const telaDePontuacao = document.querySelector("#pontuacao")

    // --- Estado inicial (imutável) ---
    const largura = 16
    const total = quadradinhos.length
    const altura = total / largura

    const estadoInicial = {
        largura,
        total,
        altura,
        jogador: 352, // já está alinhado com sua grade
        inimigos: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        32, 33, 34, 35, 36, 37, 38, 39, 40, 41
        ],
        dirHorizontal: 1,
        lasers: [],
        explosoes: [],      // posições que exibem "boom" por 1 tick
        pontuacao: 0,
        status: "jogando"   // "jogando" | "vitoria" | "derrota"
    }

    // Única variável mutável para “trocar” o estado renderizado na tela
    let estadoAtual = estadoInicial

    // --- Funções puras de atualização de estado ---
    const moverJogador = (estado, tecla) => {
        const { largura, jogador, status } = estado
        if (status !== "jogando") return estado

        if (tecla === "ArrowLeft" && jogador % largura !== 0) {
            return { ...estado, jogador: jogador - 1 }
        } else if (tecla === "ArrowRight" && jogador % largura !== largura - 1) {
            return { ...estado, jogador: jogador + 1 }
        } else if (tecla === " " || tecla === "Spacebar" || tecla === "Space") {
            return atirar(estado)
        } else {
            return estado
        }
    }

    const atirar = (estado) => {
        const { jogador, largura, status } = estado
        if (status !== "jogando") return estado

        const origem = jogador - largura
        // se já está na borda superior, não cria laser
        if (origem < 0) return estado

        // permite múltiplos lasers; para 1 por vez, filtre por length === 0
        return { ...estado, lasers: [...estado.lasers, origem] }
    }

    const moverInimigos = (estado) => {
        const { largura, inimigos, dirHorizontal, total, jogador, status } = estado
        if (status !== "jogando") return estado
        if (inimigos.length === 0) return { ...estado, status: "vitoria" }

        const anyAtLeft  = inimigos.some(p => p % largura === 0)
        const anyAtRight = inimigos.some(p => p % largura === largura - 1)

        // se algum inimigo atingiu a borda na direção atual -> desce e inverte a direção horizontal
        if ((dirHorizontal === -1 && anyAtLeft) || (dirHorizontal === 1 && anyAtRight)) {
            const novosInimigos = inimigos.map(p => p + largura)
            const novoDirHorizontal = -dirHorizontal
            const baseInicio = total - largura
            const chegouNaBase = novosInimigos.some(p => p >= baseInicio)
            const colidiuComJogador = novosInimigos.includes(jogador)
            const novoStatus = colidiuComJogador || chegouNaBase ? "derrota"
                            : (novosInimigos.length === 0 ? "vitoria" : "jogando")
            return { ...estado, inimigos: novosInimigos, dirHorizontal: novoDirHorizontal, status: novoStatus }
        }

        // caso normal: move horizontalmente
        const novosInimigos = inimigos.map(p => p + dirHorizontal)
        const baseInicio = total - largura
        const chegouNaBase = novosInimigos.some(p => p >= baseInicio)
        const colidiuComJogador = novosInimigos.includes(jogador)
        const novoStatus = colidiuComJogador || chegouNaBase ? "derrota"
                        : (novosInimigos.length === 0 ? "vitoria" : "jogando")
        return { ...estado, inimigos: novosInimigos, dirHorizontal: dirHorizontal, status: novoStatus }
    }

    const moverLasers = (estado) => {
        const { lasers, largura, inimigos, pontuacao, status } = estado
        if (status !== "jogando") return estado
        if (lasers.length === 0 && inimigos.length === 0) return { ...estado, status: "vitoria" }

        // avança lasers para cima (-largura), detecta colisões
        const avancados = lasers
        .map(p => p - largura)
        .filter(p => p >= 0) // remove lasers que saíram da grade

        // colisões: se um laser coincide com um inimigo, removemos os dois
        const { sobreviventesInimigos, lasersRestantes, explosoesGeradas, pontosGanho } =
        detectarColisoes(avancados, inimigos)

        const novoStatus = sobreviventesInimigos.length === 0 ? "vitoria" : estado.status

        return {
        ...estado,
        lasers: lasersRestantes,
        inimigos: sobreviventesInimigos,
        explosoes: explosoesGeradas, // exibidas por 1 tick
        pontuacao: pontuacao + pontosGanho,
        status: novoStatus
        }
    }

    // Função pura auxiliar para colisões
    const detectarColisoes = (lasers, inimigos) => {
        // transforme inimigos em Set para lookup O(1)
        const setInimigos = new Set(inimigos)

        const acertos = lasers.filter(l => setInimigos.has(l))
        const lasersRestantes = lasers.filter(l => !setInimigos.has(l))
        const inimigosRestantes = inimigos.filter(i => !acertos.includes(i))

        // Cada acerto vale 10 pontos (ajuste se quiser)
        const pontosGanho = acertos.length * 10

        return {
        sobreviventesInimigos: inimigosRestantes,
        lasersRestantes,
        explosoesGeradas: acertos, // mesmas posições para desenhar "boom"
        pontosGanho
        }
    }

    // --- Renderização (efeito colateral isolado) ---
    const renderizar = (anterior, atual) => {
        // Limpa classes do estado anterior
        quadradinhos[anterior.jogador].classList.remove("jogador")
        anterior.inimigos.forEach(p => quadradinhos[p]?.classList.remove("inimigo"))
        anterior.lasers.forEach(p => quadradinhos[p]?.classList.remove("laser"))
        anterior.explosoes.forEach(p => quadradinhos[p]?.classList.remove("boom"))

        // Aplica classes do estado atual
        quadradinhos[atual.jogador].classList.add("jogador")
        atual.inimigos.forEach(p => quadradinhos[p]?.classList.add("inimigo"))
        atual.lasers.forEach(p => quadradinhos[p]?.classList.add("laser"))
        atual.explosoes.forEach(p => quadradinhos[p]?.classList.add("boom"))

        // Pontuação e status
        if (telaDePontuacao) {
            telaDePontuacao.textContent = String(atual.pontuacao)
        }

        if (atual.status !== "jogando") {
        // Mostra uma mensagem simples usando a própria grade
            const msg = atual.status === "vitoria" ? "VOCÊ VENCEU!" : "VOCÊ PERDEU!"
        // Opcional: alert(msg) // evitei alert para não “poluir” FP, mas é útil para debug
            console.log(msg)
        }
    }

    const atualizarEstado = (novoEstado) => {
        renderizar(estadoAtual, novoEstado)
        estadoAtual = novoEstado
    }

    let espacoPressionado = false
    let intervaloTiro = null

    document.addEventListener("keydown", (evento) => {
        const tecla = evento.code === "Space" ? " " : evento.key

        if (tecla === " ") {
            if (!espacoPressionado) {
                espacoPressionado = true
                const novo = atirar(estadoAtual)
                if (novo !== estadoAtual) atualizarEstado(novo)

                intervaloTiro = setInterval(() => {
                    if (espacoPressionado && estadoAtual.status === "jogando") {
                        const novo = atirar(estadoAtual)
                        if (novo !== estadoAtual) atualizarEstado(novo)
                    }
                }, 500)
            }
        } else {
            const novo = moverJogador(estadoAtual, tecla)
            if (novo !== estadoAtual) atualizarEstado(novo)
        }
    })

    document.addEventListener("keyup", (evento) => {
        const tecla = evento.code === "Space" ? " " : evento.key
        if (tecla === " ") {
            espacoPressionado = false
            if (intervaloTiro) {
                clearInterval(intervaloTiro)
                intervaloTiro = null
            }
        }
    })

  // --- Loops ---
    const tickInimigos = () => {
        if (estadoAtual.status !== "jogando") return
        atualizarEstado(moverInimigos(estadoAtual))
        setTimeout(tickInimigos, 500)
    }

    const tickLasers = () => {
        if (estadoAtual.status !== "jogando") return
        const semExplosoes = estadoAtual.explosoes.length
        ? { ...estadoAtual, explosoes: [] }
        : estadoAtual
        atualizarEstado(moverLasers(semExplosoes))
        setTimeout(tickLasers, 80)
    }

    // --- Inicialização ---
    atualizarEstado(estadoInicial)
    tickInimigos()
    tickLasers()
})
