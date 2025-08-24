document.addEventListener('DOMContentLoaded', () => {
    const quadradinhos = document.querySelectorAll(".grid div")
    const telaDePontuacao = document.querySelector("#pontuacao")
    const inimigos = [
         0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
         16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
        32, 33, 34, 35, 36, 37, 38, 39, 40, 41
    ]
    //Cria o estado inicial do jogo, definindo a posição inicial do jogador e a largura da grade. Um freeze é usado para garantir a imutabilidade.
    const estadoInicial = Object.freeze({ largura: 16, jogador: 352})
    let direcao = 1
    let pontuacao = 0
    let inimigosDerrotados = []
    inimigos.map((inimigos) => quadradinhos[inimigos].classList.add("inimigo"))
    

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

    /*A função renderizar atualiza o que é exibido na tela, ela recebe o estado anterior e o novo estado. Caso sejam diferentes, ela tira o trem da posição anterior e
    o adiciona na nova posição.*/
    const renderizar = (estadoAnterior, estadoAtual) => {
        if (estadoAnterior !== estadoAtual) {
        quadradinhos[estadoAnterior.jogador].classList.remove("jogador")
        quadradinhos[estadoAtual.jogador].classList.add("jogador")
        }
    }

    //A função loop recebe o estado atual do jogador e utiliza recursão e closure para atualizar e renderizar o estado em loop
    const loop = (estado) => {
        //Faz a primeira renderização do jogador, em seu estado inicial.
        quadradinhos[estado.jogador].classList.add("jogador")
        /*Função que calcula o próximo estado e é acionada sempre que um tecla é pressionada, por conta do addEventListener. O uso do closure é
        importante para que a função tenha acesso ao argumento de loop(estado) e possa funcionar.*/
        const calculaEstado = (evento) => {
            //Chama as funções moverJogador e renderizar para calcular e renderizar o novo estado.
            const novoEstado = moverJogador(estado, evento.key)
            renderizar(estado, novoEstado)
            //Exclui o próprio event listener.
            document.removeEventListener("keydown", calculaEstado) 
            //chama a função loop de forma recursiva.
            loop(novoEstado) 
        }
        document.addEventListener("keydown", calculaEstado)
    }

    loop(estadoInicial)

    function moverInimigos() {
        const bordaEsquerda = inimigos[0] % largura === 0
        const bordaDireita = inimigos[inimigos.length -1] % largura === largura -1
        if ((bordaEsquerda && direcao === -1) || (bordaDireita && direcao ===1)) {
            direcao = largura
        } else if (direcao === largura) {
           if (bordaEsquerda) direcao = 1
           else direcao = -1 
        }
        for (let i = 0; i <= inimigos.length -1; i++) {
            quadradinhos[inimigos[i]].classList.remove('inimigo')
        }
        for (let i = 0; i <= inimigos.length -1; i++) {
            inimigos[i] += direcao
        }
        for (let i = 0; i <= inimigos.length -1; i++) {
            if (!inimigosDerrotados.includes(i)) {
                quadradinhos[inimigos[i]].classList.add('inimigo')
            }
        }
        if (quadradinhos[posicaoProtagonista].classList.contains('inimigo', 'protagonista')) {
            telaDePontuacao.textContent = 'Game Over'
            quadradinhos[posicaoProtagonista].classList.add('boom')
            clearInterval(InimigoId)
        }
        for (let i =0; i <= inimigos.length -1; i++) {
            if (inimigos[i] > (quadradinhos.length - (largura-1))) {
                telaDePontuacao.textContent = 'Game Over'
                clearInterval(InimigoId)
            }
        }
        if (inimigosDerrotados.length === inimigos.length) {
            telaDePontuacao.textContent = 'You Win'
            clearInterval(InimigoId)
        }
    }
    InimigoId = setInterval(moverInimigos, 250)
    function atirar(e) {
        let laserId
        let posicaoDoLaser = posicaoProtagonista
        function moverLaser() {
            quadradinhos[posicaoDoLaser].classList.remove('laser')
            posicaoDoLaser -= largura
            quadradinhos[posicaoDoLaser].classList.add('laser')
            if (quadradinhos[posicaoDoLaser].classList.contains('inimigo')) {
                quadradinhos[posicaoDoLaser].classList.remove('laser')
                quadradinhos[posicaoDoLaser].classList.remove('inimigo')
                quadradinhos[posicaoDoLaser].classList.add('boom')
                setTimeout(() => quadradinhos[posicaoDoLaser].classList.remove('boom'), 50)
                clearInterval(laserId)
                const inimigoAtingido = inimigos.indexOf(posicaoDoLaser)
                inimigosDerrotados.push(inimigoAtingido)
                pontuacao++
                telaDePontuacao.textContent = pontuacao
            }
            if (posicaoDoLaser < largura) {
                clearInterval(laserId)
                setTimeout(() => quadradinhos[posicaoDoLaser].classList.remove('laser'), 100)
            }  
        }
        switch(e.keyCode) {
            case 32:
                laserId = setInterval(moverLaser, 50)
                break
        }
    }
    document.addEventListener('keyup', atirar)
})