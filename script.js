//Esta primeira linha nos garante que o código js só será executando quando todo o conteúdo da página tiver sido carregado.
document.addEventListener('DOMContentLoaded', () => {
    //Seleciona todos os divs que compõem a grade do jogo. (cada div é uma posição que pode ser ocupada por um elemento como um inimigo, um laser ou o próprio jogador)
    const quadradinhos = document.querySelectorAll(".grid div")
    //Seleciona o elemento que vai mostrar a pontuação do jogo.
    const telaDePontuacao = document.querySelector("#pontuacao")

    /*Cria o estado inicial do jogo, definindo a largura e o tamanho total da grade, a posição inicial do jogador e dos inimigos, a direção de movimento dos
    inimigos.*/
    const estadoInicial = {
        largura: 16,
        total: quadradinhos.length,
        jogador: 352, //O jogador inicia na região inferior da grade
        inimigos: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41
        ], //Os inimigos, inicialmente, ocupam as primeiras linhas da grade.
        direcao: 1, //1 significa que o sentido é para a direita, -1 é para a esquerda
        lasers: [], //Lista que contém os lasers ativos
        explosoes: [],
        pontuacao: 0, //Contador de pontos do jogo.
        status: "jogando" //Indica que o jogo está ativo. (vitoria / jogando / derrota)
    }

    //Aqui usamos uma variável mutável para atualizar o estado renderizado na tela.
    let estadoAtual = estadoInicial

    //A função para mover o jogador recebe o estado atual do jogador e a tecla pressionada.
    const moverJogador = (estado, tecla) => {
        //Copia as informações relevantes do estado atual que servirão para calcular o novo estado.
        const { largura, jogador, status } = estado
        //Se o jogo não estiver ativo, não altera o estado.
        if (status !== "jogando") return estado
        /*Se o usuário pressionar a seta para a esquerda ou a tecla A e o jogador não estiver encostado na borda esquerda, o estado é alterado, com a posição do jogador decrementada
        (ou seja, o jogador se move uma posição para e esquerda na grade).*/
        else if ((tecla === "ArrowLeft" || tecla === "a" || tecla === "A") && jogador % largura !== 0)  return { ...estado, jogador: jogador - 1 }
        /*Se o usuário pressionar a seta para a direita ou a tecla D e o jogador não estiver encostado na borda direita, o estado é alterado, com a posição do jogador incrementada
        (ou seja, o jogador se move uma posição para e direita na grade).*/
        else if ((tecla === "ArrowRight" || tecla === "d" || tecla === "D") && jogador % largura !== largura - 1) return { ...estado, jogador: jogador + 1 }
        //Caso a tecla pressionada seja a barra de espaço, chama a função atirar.
        else if (tecla === " " || tecla === "Spacebar" || tecla === "Space") return atirar(estado)
        //Caso nenhuma condição seja satisfeita, retorna o estado inalterado.
        else return estado
    }
    //Função que dispara o laser.
    const atirar = (estado) => {
        //Copia as informações relevantes do estado atual para o disparo dos lasers.
        const { jogador, largura, status } = estado
        //Verifica se o jogo está ativo, retornando o estado inalterado caso esteja inativo.
        if (status !== "jogando") return estado
        //Define a posição onde surge o laser, que é uma posição acima da posição do jogador.
        const origem = jogador - largura
        //Retorna o estado incluindo o disparo na lista 'lasers'.
        return { ...estado, lasers: [...estado.lasers, origem]}
    }
    //Função auxiliar para a movimentação do jogador.
    const avaliarStatus = (novosInimigos, estado) => {
        //Copia as informações relevantes do estado para a avaliação do novo status.
        const { jogador, largura, total } = estado
        //Calcula a última linha da grade do jogo (na verdade, esta é a última posição da penúltima linha, mas será considerada para o cálculo da última linha)
        const ultimaLinha = total - largura
        //Verifica se algum inimigos alcançou o última linha da grade do jogo.
        const chegouNaBase = novosInimigos.some(p => p > ultimaLinha)
        //Verifica se houve alguma colisão entre o jogador e um inimigo
        const colidiuComJogador = novosInimigos.includes(jogador)
        //Caso o jogador tenha colidido com um inimigo ou algum inimigos alcançou a última linha, o jogador perde.
        if (colidiuComJogador || chegouNaBase) return "derrota"
        //Caso não hajam mais inimigos, o jogador vence.
        else if (novosInimigos.length === 0) return "vitoria"
        //Caso nenhuma condição seja satisfeita, retorna o estado recebido.
        else return estado.status
    }
    //Função responsável por movimentar os inimigos.
    const moverInimigos = (estado) => {
        //Copia as informações relevantes do código para a movimentação dos inimigos.
        const { largura, inimigos, direcao, status } = estado
        //Se o jogo estiver inativo, mantém o estado inalterado.
        if (status !== "jogando") return estado
        //Verifica se algum inimigo chegou nas bordas da grade do jogo.
        const bateuNaBordaEsquerda = inimigos.some(p => p % largura === 0) 
        const bateuNaBordaDireita  = inimigos.some(p => p % largura === largura - 1)
        //O if representa o caso dos inimigos chegarem em alguma das bordas. O else representa o caso dos inimigos não estarem em nenhuma das bordas.
        if ((direcao === -1 && bateuNaBordaEsquerda) || (direcao === 1 && bateuNaBordaDireita)) {
            //Os inimigos descem uma posição
            const novosInimigos = inimigos.map(p => p + largura)
            //Mudam de direção
            const novaDirecao = -direcao 
            //Calcula o novo status do jogo com base na nova posição dos inimigos.
            const novoStatus = avaliarStatus(novosInimigos, estado)
            //Retorna o novo estado.
            return { ...estado, inimigos: novosInimigos, direcao: novaDirecao, status: novoStatus }
        } else {
            //Os inimigos se deslocam para a quadrado ao lado, de acordo com o sentido do movimento.
            const novosInimigos = inimigos.map(p => p + direcao)
            //Calcula o novo status do jogo com base na nova posição dos inimigos
            const novoStatus = avaliarStatus(novosInimigos, estado)
            //Retorna o novo estado
            return { ...estado, inimigos: novosInimigos, status: novoStatus }
        }
    }
    const moverLasers = (estado) => {
        const { lasers, largura, inimigos, pontuacao, status } = estado
        if (status !== "jogando") return estado
        if (lasers.length === 0 && inimigos.length === 0) return { ...estado, status: "vitoria" }

        const avancados = lasers
        .map(p => p - largura)
        .filter(p => p >= 0)

        const { sobreviventesInimigos, lasersRestantes, explosoesGeradas, pontosGanho } =
        detectarColisoes(avancados, inimigos)

        const novoStatus = sobreviventesInimigos.length === 0 ? "vitoria" : estado.status

        return {
        ...estado,
        lasers: lasersRestantes,
        inimigos: sobreviventesInimigos,
        explosoes: explosoesGeradas, 
        pontuacao: pontuacao + pontosGanho,
        status: novoStatus
        }
    }

    const detectarColisoes = (lasers, inimigos) => {
        
        const setInimigos = new Set(inimigos)

        const acertos = lasers.filter(l => setInimigos.has(l))
        const lasersRestantes = lasers.filter(l => !setInimigos.has(l))
        const inimigosRestantes = inimigos.filter(i => !acertos.includes(i))

        const pontosGanho = acertos.length * 10

        return {
        sobreviventesInimigos: inimigosRestantes,
        lasersRestantes,
        explosoesGeradas: acertos, 
        pontosGanho
        }
    }

    const renderizar = (anterior, atual) => {
    
        quadradinhos[anterior.jogador].classList.remove("jogador")
        anterior.inimigos.map(p => quadradinhos[p]?.classList.remove("inimigo"))
        anterior.lasers.map(p => quadradinhos[p]?.classList.remove("laser"))
        anterior.explosoes.map(p => quadradinhos[p]?.classList.remove("boom"))

        quadradinhos[atual.jogador].classList.add("jogador")
        atual.inimigos.map(p => quadradinhos[p]?.classList.add("inimigo"))
        atual.lasers.map(p => quadradinhos[p]?.classList.add("laser"))
        atual.explosoes.map(p => quadradinhos[p]?.classList.add("boom"))

        telaDePontuacao.textContent = atual.pontuacao

        if (atual.status !== "jogando") {
            const msg = atual.status === "vitoria" ? "VOCÊ VENCEU!" : "VOCÊ PERDEU!"
            alert(msg)
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

    atualizarEstado(estadoInicial)
    tickInimigos()
    tickLasers()
})
