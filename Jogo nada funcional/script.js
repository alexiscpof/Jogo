document.addEventListener('DOMContentLoaded', () => {
    const quadradinhos = document.querySelectorAll(".grid div")
    const telaDePontuacao = document.querySelector("#pontuacao")
    const largura = 16
    let posicaoProtagonista = 352
    let inimigosDerrotados = []
    let pontuacao = 0
    let direcao = 1
    let InimigoId
    telaDePontuacao.textContent = pontuacao
    const inimigos = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        16,17,18,19,20,21,22,23,24,25,
        32,33,34,35,36,37,38,39,40,41
    ]

    inimigos.map(inimigo => quadradinhos[inimigo].classList.add('inimigo'))
    quadradinhos[posicaoProtagonista].classList.add('protagonista')

    function moverProtagonista(e) {
        quadradinhos[posicaoProtagonista].classList.remove('protagonista')
        switch(e.keyCode) {
            case 37:
                if (posicaoProtagonista % largura !== 0) posicaoProtagonista -=1
                break
            case 39:
                if (posicaoProtagonista % largura < largura -1) posicaoProtagonista +=1
                break
        }
        quadradinhos[posicaoProtagonista].classList.add('protagonista')
    }
    document.addEventListener('keydown', moverProtagonista)

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
            estado=atualizarPontuacao(estado,posicaoDoLaser)
            render(estado,quadradinhos,pontuacao)
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