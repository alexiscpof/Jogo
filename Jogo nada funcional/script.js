document.addEventListener('DOMContentLoaded', () => {
    const quadradinhos = document.querySelectorAll(".grid div")
    const telaDePontuacao = document.querySelector("#pontuacao")
       //Cria o estado inicial do jogo, definindo a posição inicial do jogador e dos inimigos, a direção e a largura da grade.
    const estadoInicial = { 
        largura: 16, 
        jogador: 359,
        inimigos: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41
        ],
        direcao: 1,
    } 
    let estadoAtual = estadoInicial
   
    /*A função para mover o jogador utiliza o último estado do jogador e uma tecla pressionada. Caso a tecla pressionada seja a seta para a esquerda e o jogador não esteja
    encostado na borda esquerda (é isso que a condição jogador%largura !== 0 significa), a função retorna um novo estado com a posição do jogador decrementada. Caso a
    tecla pressionada seja a seta para direita e o jogador não esteja encostado na borda direita (é isso que a condição jogador%largura!==largura-1 significa), a função
    retorna um novo estado com a posição do jogador incrementada. Caso nenhuma das condições seja satisfeita, a função retorna o mesmo estado recebido.*/
    const moverJogador = (estado, tecla) => {
        const { largura, jogador } = estado
        if (tecla === "ArrowLeft" && jogador % largura !== 0) return { ...estado, jogador: jogador - 1 }
        else if (tecla === "ArrowRight" && jogador % largura !== largura - 1) return { ...estado, jogador: jogador + 1 }
        else return estado
    }

    const moverInimigos = (estado) => {
        const { largura, inimigos, direcao } = estado

        const bordaEsquerda = Math.min(...inimigos) % largura === 0
        const bordaDireita  = Math.max(...inimigos) % largura === largura - 1
            /*A função calcularNovaDirecao verifica se os inimigos atingiram a borda esquerda ou direita da grade. Se atingiram a borda esquerda e estão se movendo para a esquerda
        (direcao === -1) ou se atingiram a borda direita.*/
        const calcularNovaDirecao = () => {
            if ((bordaEsquerda && direcao === -1) || (bordaDireita && direcao === 1)) {
            return largura
            } else if (direcao === largura) {
            return bordaEsquerda ? 1 : -1
            } else {
            return direcao
            }
        }
        
        const novaDirecao = calcularNovaDirecao()
        const novosInimigos = inimigos.map((pos) => pos + novaDirecao)

        return { ...estado, inimigos: novosInimigos, direcao: novaDirecao }
    }


    /*A função renderizar atualiza o que é exibido na tela, ela recebe o estado anterior e o novo estado. Caso sejam diferentes, ela tira o trem da posição anterior e
    o adiciona na nova posição.*/
    const renderizar =  (estadoAnterior, estadoAtual) => {

        quadradinhos[estadoAnterior.jogador].classList.remove("jogador")
        quadradinhos[estadoAtual.jogador].classList.add("jogador")

        estadoAnterior.inimigos.map((posicao) => { quadradinhos[posicao].classList.remove("inimigo") })
        estadoAtual.inimigos.map((posicao) => { quadradinhos[posicao].classList.add("inimigo") })
    }
        const atualizarEstado = (novoEstado) => {
        renderizar(estadoAtual, novoEstado)
        estadoAtual = novoEstado
    }

    document.addEventListener("keydown", (evento) => {
        const novoEstado = moverJogador(estadoAtual, evento.key)
        if (novoEstado !== estadoAtual) atualizarEstado(novoEstado)
    })

    const tickInimigos = () => {
        const novoEstado = moverInimigos(estadoAtual)
        atualizarEstado(novoEstado)
        setTimeout(tickInimigos, 500)
    }

    atualizarEstado(estadoInicial)
    tickInimigos()

    document.addEventListener('keyup', atirar)
})
