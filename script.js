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
        jogador: 352, //O jogador inicia na região inferior da grade.
        inimigos: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41
        ], //Os inimigos, inicialmente, ocupam as primeiras linhas da grade.
        direcao: 1, //1 significa que o sentido é para a direita, -1 é para a esquerda.
        lasers: [], //Lista que contém os lasers ativos.
        explosoes: [],
        pontuacao: 0, //Contador de pontos do jogo.
        status: "jogando", //Indica que o jogo está ativo. (vitoria / jogando / derrota)
        ultimoTiro: 0 //Marca o tempo do último tiro disparado pelo jogador.
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
    //Função que move os lasers disparados pelo jogador.
    const moverLasers = (estado) => {
        //Copia as informações relevantes do estado para a movimentação do laser.
        const { lasers, largura, inimigos, pontuacao, status } = estado
        //Verifica a atividade do jogo, em caso de inatividade, retorna o estado inalterado
        if (status !== "jogando") return estado
        //Move todos os lasers uma posição para cima e filtra somente aqueles que ainda estão dentro da grade
        const novaPosicaoLasers = lasers.map((laser) => laser - largura).filter((laser) => laser >= 0)
        //Chama a função 'detectarColisoes' para calcular o estado após o deslocamento dos lasers.
        const { inimigosSobreviventes, lasersEmCampo, novasExplosoes, pontosGanho } = detectarColisoes(novaPosicaoLasers, inimigos)
        //Chama a função 'avaliarStatus' para calcular o novo estado após o deslocamento dos lasers.
        const novoStatus = avaliarStatus(inimigosSobreviventes, estado)
        //Retorna o novo estado.
        return { ...estado, lasers: lasersEmCampo, inimigos: inimigosSobreviventes, 
            explosoes: novasExplosoes, pontuacao: pontuacao + pontosGanho, status: novoStatus 
        }
    }
    //Função que detecta colisões entre lasers e inimigos e calcula o estado após a colisão.
    const detectarColisoes = (lasers, inimigos) => {
        //Declara um acerto, verificando se há algum inimigo que está na mesma posição que um laser.
        const acertos = lasers.filter((laser) => inimigos.includes(laser))
        //Se um laser não colidiu com nenhum inimigos, ele entra nesta lista.
        const lasersEmCampo = lasers.filter((laser) => !inimigos.includes(laser))
        //As posições que possuem inimigos e que não estão na lista de acertos entram aqui.
        const inimigosRestantes = inimigos.filter((inimigo) => !acertos.includes(inimigo))
        //Calcula a pontuação, neste caso, cada acerto garante 10 pontos ao jogador.
        const pontosGanho = acertos.length * 10
        //Retorna os inimigos que sobreviveram, os lasers em jogo, as posições onde houveram acertos (e consequentemente explosões), e os pontos ganhos.
        return { inimigosSobreviventes: inimigosRestantes, lasersEmCampo, novasExplosoes: acertos, pontosGanho }
    }
    //Função que mostra o estado atual na tela. Ela recebe o estado anterior e estado atual.
    const renderizar = (anterior, atual) => {
        //Remove os objetos das suas posições no estado anterior.
        quadradinhos[anterior.jogador].classList.remove("jogador")
        anterior.inimigos.map((posicao) => quadradinhos[posicao].classList.remove("inimigo"))
        anterior.lasers.map((posicao) => quadradinhos[posicao].classList.remove("laser"))
        anterior.explosoes.map(posicao => quadradinhos[posicao].classList.remove("boom"))
        //Adiciona os objetos em suas novas posições no estado atual.
        quadradinhos[atual.jogador].classList.add("jogador")
        atual.inimigos.map(posicao => quadradinhos[posicao].classList.add("inimigo"))
        atual.lasers.map(posicao => quadradinhos[posicao].classList.add("laser"))
        atual.explosoes.map(posicao => quadradinhos[posicao].classList.add("boom"))
        //Atualiza a exibição dos pontos.
        telaDePontuacao.textContent = atual.pontuacao
        //Verifica o status e exibe uma mensagem caso o vencedor vença ou perca.
        if (atual.status !== "jogando") {
            const mensagem = atual.status === "vitoria" ? "You Win!" : "Game Over!"
            alert(mensagem)
        }
    }
    //Esta função atualiza o estado do jogo, recebendo o novo estado calculado pelas funções acima, renderiza ele e em seguida reatribui o valor da variável do estado.
    const atualizarEstado = (novoEstado) => {
        renderizar(estadoAtual, novoEstado)
        estadoAtual = novoEstado
    }
    //Sempre que o usuário pressiona uma tecla, este trecho do código é acionado e a função contida dentro dele é executada.
    document.addEventListener("keydown", (evento) => {
        //Detecta qual tecla foi pressionada, caso seja a barra de espaço, trabalha com um string.
        const tecla = evento.code === "Space" ? " " : evento.key
        //Se a tecla pressionada foi a barra de espaço...
        if (tecla === " ") {
            //Utiliza a função Date.now que serve como marcador de tempo, ela retorna a quantidade de milissegundos passados desde o ínicio de 1970 (não é funcional).
            const agora = Date.now()
            //Verifica se já se passaram pelo menos 500 ms desde o último tiro.
            if (agora - estadoAtual.ultimoTiro >= 500) { 
                //Chama a função atirar, atualiza o estado após o disparo e redefine o tempo desde o último tiro.
                const novo = atirar(estadoAtual)
                atualizarEstado({ ...novo, ultimoTiro: agora })
            }
        } else {
            //Caso a tecla pressionada não tenha sido a barra de espaço, chama a função moverJogador e após o cálculo do novo estado, atualiza-o caso seja diferente do último.
            const novo = moverJogador(estadoAtual, tecla)
            if (novo !== estadoAtual) atualizarEstado(novo)
        }
    })      
    //Timer do movimento dos inimigos.
    const timerInimigos = () => {
        //Se o jogo não estiver ativo, a função não retorna nada.
        if (estadoAtual.status !== "jogando") return
        //Calcula e atualiza o novo estado após o deslocamento das naves inimigas.
        const novo = moverInimigos(estadoAtual)
        atualizarEstado(novo)
        //A função é executada a cada meio segundo.
        setTimeout(timerInimigos, 500)
    }
    //Timer do movimento dos lasers
    const timerLasers = () => {
        //Caso o jogo não esteja ativo, a função não retorna nada.
        if (estadoAtual.status !== "jogando") return
        //Remove as explosões do campo do jogo.
        const limparExplosoes = estadoAtual.explosoes.length ? { ...estadoAtual, explosoes: [] } : estadoAtual
        //Calcula e atualiza o novo estado após o deslocamento dos lasers.
        const novo = moverLasers(limparExplosoes)
        atualizarEstado(novo)
        //A função é executada a cada 50 milissegundos.
        setTimeout(timerLasers, 50)
    }
    //Chamada das funções responsáveis pelo loops do jogo.
    atualizarEstado(estadoInicial)
    timerInimigos()
    timerLasers()
})